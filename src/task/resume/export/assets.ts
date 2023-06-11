const prettierAssets = {
  prettierOptions: '.prettierrc',
};

const styleAssets = {
  styles: './assets/styles.css',
};

const markdownTemplateAssets = {
  mdTemplate: './assets/resume.md',
};

const withNavbar = {
  navbarTemplate: './assets/navbar.html',
};

const withFooter = { footerTemplate: './assets/footer.html' };

export const jsonAssets = { ...prettierAssets };
export const htmlAssets = { ...prettierAssets, ...styleAssets, ...withNavbar };
export const mdAssets = { ...prettierAssets, ...markdownTemplateAssets };
export const pdfAssets = { ...styleAssets, ...withFooter };
