window.config = {
  routerBasename: '/dicom',
  showStudyList: true,
  extensions: [],
  modes: [],
  disableEditing: true,
  // below flag is for performance reasons, but it might not work for all servers

  showWarningMessageForCrossOrigin: true,
  showCPUFallbackMessage: true,
  showLoadingIndicator: true,
  strictZSpacingForVolumeViewport: true,
  defaultDataSourceName: 'dicomweb',
  dataSources: [
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'dicomweb',
      configuration: {
        friendlyName: 'Orthanc Server',
        name: 'Orthanc',
        wadoUriRoot: '/pacs/dicom-web',
        qidoRoot: '/pacs/dicom-web',
        wadoRoot: '/pacs/dicom-web',
        qidoSupportsIncludeField: true,
        supportsReject: true,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: true,
        supportsWildcard: true,
        dicomUploadEnabled: true,
        bulkDataURI: {
          enabled: true,
        },
      },
    },
  ],
  // This is an array, but we'll only use the first entry for now
  // oidc: [
  //   {
  //     // ~ REQUIRED
  //     // Authorization Server URL
  //     authority: '/kc/realms/midas',
  //     client_id: 'ohif-viewer',
  //     redirect_uri: '/callback', // `OHIFStandaloneViewer.js`
  //     // "Authorization Code Flow"
  //     // Resource: https://medium.com/@darutk/diagrams-of-all-the-openid-connect-flows-6968e3990660
  //     response_type: 'code',
  //     scope: 'openid', // email profile openid
  //     // ~ OPTIONAL
  //     post_logout_redirect_uri: '/logout-redirect.html',
  //   },
  // ],
};