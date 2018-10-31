export const environment = {
    production: false,
    managerDashboardMode: false,
    region: 'us',
    tbtLocale: 'en-US',
    lang: 'en',
    rosConfig: {
        il: 'https://ros-rp-beta.tabit.cloud/',
        us: 'https://us-ros-rp.tabit.cloud/'
    },
    remoteDatabases: {
        il: 'https://analytics-dev.tabit.cloud/olapproxy/handler.ashx',
        us: 'https://analytics-us.tabit.cloud/olapproxy/handler.ashx'
    },
    olapConfig: {//US PROD CUBE
        baseUrl: 'https://analytics-dev.tabit.cloud/proxyV2/il-prod/proxy.ashx',
        sqlServerProxy: 'https://analytics-us.tabit.cloud/olapproxy/handler.ashx',
        catalog: 'isrProd',
        cube: 'tlogs',
    },
    translationBaseUrl: './assets/i18n/'
};
