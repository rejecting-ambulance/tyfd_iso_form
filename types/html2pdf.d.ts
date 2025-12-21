
declare module 'html2pdf.js' {
    interface Html2PdfOptions {
        margin?: number | number[];
        filename?: string;
        image?: { type: string; quality: number };
        html2canvas?: any;
        jsPDF?: any;
    }

    interface Html2Pdf {
        set(options: Html2PdfOptions): Html2Pdf;
        from(element: HTMLElement | string): Html2Pdf;
        save(): void;
        toPdf(): Html2Pdf;
        getPdf(): any;
        output(type: string, options: any): any;
    }

    function html2pdf(): Html2Pdf;
    function html2pdf(element: HTMLElement | string, options?: Html2PdfOptions): Html2Pdf;

    export = html2pdf;
}
