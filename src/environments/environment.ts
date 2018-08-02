export const environment = {
    production: false,
    region: 'il',//controls logic (BL, currency sign etc). supported: 'il'/'us'
    tbtLocale: 'he-IL',//controls localization (directions, translations, formattings, plurals etc.) supported: 'he-IL'/'en-US'
    rosConfig: {
        baseUrl: 'https://ros-office-beta.herokuapp.com/',
    },
    olapConfig: {
        baseUrl: 'https://analytics-dev.tabit.cloud/proxyV2/il-prod/proxy.ashx',
        sqlServerProxy: 'https://analytics-dev.tabit.cloud/olapproxy/handler.ashx',
        catalog: 'isrProd',
        cube: 'tlogs',
    }
};
