export const environment = {
  production: true,
  region: 'il',
  tbtLocale: 'he-IL',//
  rosConfig: {//IL 'BETA' 'REPORTS'
    baseUrl: 'https://ros-office-beta.herokuapp.com/'
  },
  olapConfig: {//IL PROD CUBE
    baseUrl: 'https://analytics.tabit.cloud/olapproxy/proxy.ashx',
    catalog: 'isrProd',
    cube: 'tlogs',
  }
};
