// Simple constants for configuring rules
const DISABLED = 'off';
// const WARNING = ['warn'];
const ERROR = ['error'];

module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    createDefaultProgram: true, // WHY IS THIS SO MUCH WORK JUST TO LINT FILES
    project: 'tsconfig.json',
  },
  rules: {
    // Rules that are explicitly disabled
    '@typescript-eslint/no-explicit-any': DISABLED,
    '@typescript-eslint/no-empty-function': DISABLED,
    '@typescript-eslint/no-inferrable-types': DISABLED,
    '@typescript-eslint/no-use-before-define': DISABLED,
    '@typescript-eslint/no-non-null-assertion': DISABLED,
    '@typescript-eslint/restrict-template-expressions': DISABLED,

    // Rules that are explicitly a warning
    '@typescript-eslint/no-unused-vars': ['warn', {
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'caughtErrorsIgnorePattern': '^_',
    }],

    // Rules that are explicitly an error
    'no-console': ERROR,
    'eol-last': ERROR,
    'semi': ERROR,
    'comma-dangle': ['error', 'always-multiline'],
    '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
    // @NOTE From: https://github.com/Microsoft/TypeScript/issues/14306#issuecomment-552890299
    'no-restricted-globals': ['error', 'postMessage', 'blur', 'focus', 'close', 'frames', 'self', 'parent', 'opener', 'top', 'length', 'closed', 'location', 'origin', 'name', 'locationbar', 'menubar', 'personalbar', 'scrollbars', 'statusbar', 'toolbar', 'status', 'frameElement', 'navigator', 'customElements', 'external', 'screen', 'innerWidth', 'innerHeight', 'scrollX', 'pageXOffset', 'scrollY', 'pageYOffset', 'screenX', 'screenY', 'outerWidth', 'outerHeight', 'devicePixelRatio', 'clientInformation', 'screenLeft', 'screenTop', 'defaultStatus', 'defaultstatus', 'styleMedia', 'onanimationend', 'onanimationiteration', 'onanimationstart', 'onsearch', 'ontransitionend', 'onwebkitanimationend', 'onwebkitanimationiteration', 'onwebkitanimationstart', 'onwebkittransitionend', 'isSecureContext', 'onabort', 'onblur', 'oncancel', 'oncanplay', 'oncanplaythrough', 'onchange', 'onclick', 'onclose', 'oncontextmenu', 'oncuechange', 'ondblclick', 'ondrag', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'ondurationchange', 'onemptied', 'onended', 'onerror', 'onfocus', 'oninput', 'oninvalid', 'onkeydown', 'onkeypress', 'onkeyup', 'onload', 'onloadeddata', 'onloadedmetadata', 'onloadstart', 'onmousedown', 'onmouseenter', 'onmouseleave', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onmousewheel', 'onpause', 'onplay', 'onplaying', 'onprogress', 'onratechange', 'onreset', 'onresize', 'onscroll', 'onseeked', 'onseeking', 'onselect', 'onstalled', 'onsubmit', 'onsuspend', 'ontimeupdate', 'ontoggle', 'onvolumechange', 'onwaiting', 'onwheel', 'onauxclick', 'ongotpointercapture', 'onlostpointercapture', 'onpointerdown', 'onpointermove', 'onpointerup', 'onpointercancel', 'onpointerover', 'onpointerout', 'onpointerenter', 'onpointerleave', 'onafterprint', 'onbeforeprint', 'onbeforeunload', 'onhashchange', 'onlanguagechange', 'onmessage', 'onmessageerror', 'onoffline', 'ononline', 'onpagehide', 'onpageshow', 'onpopstate', 'onrejectionhandled', 'onstorage', 'onunhandledrejection', 'onunload', 'performance', 'stop', 'open', 'print', 'captureEvents', 'releaseEvents', 'getComputedStyle', 'matchMedia', 'moveTo', 'moveBy', 'resizeTo', 'resizeBy', 'getSelection', 'find', 'createImageBitmap', 'scroll', 'scrollTo', 'scrollBy', 'onappinstalled', 'onbeforeinstallprompt', 'crypto', 'ondevicemotion', 'ondeviceorientation', 'ondeviceorientationabsolute', 'indexedDB', 'webkitStorageInfo', 'chrome', 'visualViewport', 'speechSynthesis', 'webkitRequestFileSystem', 'webkitResolveLocalFileSystemURL', 'openDatabase'],
  },
  overrides: [
    // JavaScript-specific rules
    {
      'files': ['*.js'],
      'rules': {
        '@typescript-eslint/explicit-function-return-type': DISABLED,
        '@typescript-eslint/explicit-module-boundary-types': DISABLED,
        '@typescript-eslint/no-unsafe-member-access': DISABLED,
        '@typescript-eslint/no-unsafe-call': DISABLED,
        '@typescript-eslint/no-var-requires': DISABLED,
        '@typescript-eslint/no-unsafe-assignment': DISABLED,
      },
    },
  ],
};
