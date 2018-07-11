export const environment = {
  production: false,
  region: 'il',
  tbtLocale: 'he-IL',//
  rosConfig: {//IL 'BETA' 'REPORTS'
    // baseUrl: 'https://inpact-int.herokuapp.com/',
      baseUrl: 'https://ros-beta.tabit.cloud/'//BETA
    // baseUrl: 'https://ros-report-prd.herokuapp.com/'//PROD
  },
  olapConfig: {//IL PROD CUBE
      baseUrl: 'https://analytics-dev.tabit.cloud/olapproxy/proxy.ashx',
      sqlServerProxy: 'https://analytics-dev.tabit.cloud/olapproxy/handler.ashx',
      catalog: 'isrProd',
      cube: 'tlogs',
  }
};
