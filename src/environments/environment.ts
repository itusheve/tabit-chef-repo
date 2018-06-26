export const environment = {
  production: false,
  region: 'il',//controls logic (BL, currency sign etc). supported: 'il'/'us'
  tbtLocale: 'he-IL',//controls localization (directions, translations, formattings, plurals etc.) supported: 'he-IL'/'en-US'
  rosConfig: {
    baseUrl: 'https://ros-office-beta.herokuapp.com/',
  },
  olapConfig: {
    baseUrl: 'https://analytics.tabit.cloud/olapproxy/proxy.ashx',
    catalog: 'ssas_tabit_prod',
    cube: 'tabit_sales',
  }
};
