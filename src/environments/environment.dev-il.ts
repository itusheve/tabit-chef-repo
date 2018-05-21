export const environment = {
  production: false,
  region: 'il',
  tbtLocale: 'he-IL',//
  rosConfig: {//IL 'BETA' 'REPORTS'
    // baseUrl: 'https://inpact-int.herokuapp.com/',
    baseUrl: 'https://ros-office-beta.herokuapp.com/'//BETA
    // baseUrl: 'https://ros-report-prd.herokuapp.com/'//PROD
  },
  olapConfig: {//IL PROD CUBE
    baseUrl: 'https://analytics.tabit.cloud/olapproxy/proxy.ashx',
    catalog: 'ssas_tabit_prod',
    cube: 'tabit_sales',
  }
};
