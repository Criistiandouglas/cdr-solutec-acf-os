(() => {
  const extractPrintRules = (css) => {
    let output = "";
    let cursor = 0;
    while ((cursor = css.indexOf("@media print", cursor)) !== -1) {
      const open = css.indexOf("{", cursor);
      if (open === -1) break;
      let depth = 1;
      let end = open + 1;
      while (end < css.length && depth) {
        if (css[end] === "{") depth += 1;
        if (css[end] === "}") depth -= 1;
        end += 1;
      }
      output += css.slice(open + 1, end - 1) + "\n";
      cursor = end;
    }
    return output;
  };

  const waitForImages = async (container) => {
    const images = Array.from(container.querySelectorAll("img"));
    await Promise.all(images.map(async (img) => {
      if (!img.complete) {
        await new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      }
      try { await img.decode?.(); } catch (_) {}
    }));
  };

  window.generateOSPdf = async () => {
    const sheet = document.querySelector(".print-brand");
    const html2canvas = window.html2canvas;
    const jsPDF = window.jspdf?.jsPDF;
    if (!sheet || !html2canvas || !jsPDF) {
      window.print();
      return;
    }

    const oldScrollX = window.scrollX;
    const oldScrollY = window.scrollY;
    const temporaryStyle = document.createElement("style");
    temporaryStyle.id = "pdf-render-rules";

    try {
      const cssFiles = ["./index-DkbCDmpZ.css", "./print-one-page.css"];
      const texts = await Promise.all(cssFiles.map((url) => fetch(url).then((response) => response.text())));
      temporaryStyle.textContent = texts.map(extractPrintRules).join("\n") + `
        html, body { background: #fff !important; }
        .print-brand { margin: 0 !important; box-shadow: none !important; }
      `;
      document.head.appendChild(temporaryStyle);
      window.scrollTo(0, 0);
      await waitForImages(sheet);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const canvas = await html2canvas(sheet, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
        width: sheet.scrollWidth,
        height: sheet.scrollHeight,
        windowWidth: sheet.scrollWidth,
        windowHeight: sheet.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 210, 297, undefined, "FAST");
      const blob = pdf.output("blob");
      const filename = `Atesto-de-Servico-${new Date().toISOString().slice(0, 10)}.pdf`;
      const file = new File([blob], filename, { type: "application/pdf" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Atesto de Serviço" });
      } else {
        pdf.save(filename);
      }
    } catch (error) {
      console.error("Falha ao gerar PDF:", error);
      alert("Não foi possível gerar o PDF. Atualize o aplicativo e tente novamente.");
    } finally {
      temporaryStyle.remove();
      window.scrollTo(oldScrollX, oldScrollY);
    }
  };
})();
