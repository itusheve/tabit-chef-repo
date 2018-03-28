export const environment = {
  production: true,
  region: 'us',
  tbtLocale: 'en-US',
  rosConfig: {//US 'PROD' 'REPORTS'
    baseUrl: 'https://us-ros-rp.tabit.cloud/'
  },
  olapConfig: {//US PROD CUBE
    baseUrl: 'https://analytics-us.tabit.cloud/olapproxy/proxy.ashx',
    catalog: 'usaTabit',
    cube: 'Usadwhtabit Int',
  }
};
