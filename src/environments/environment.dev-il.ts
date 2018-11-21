export const environment = {
    production: false,
    managerDashboardMode: false,
    region: 'il',
    tbtLocale: 'he-IL',//
    lang: 'he',
    rosConfig: {
        il: 'https://ros-rp-beta.tabit.cloud/',
        us: 'https://us-int-ros.tabit-stage.com/'
    },
    remoteDatabases: {
        il: 'https://analytics-dev.tabit.cloud/chef/handler.ashx',
        us: 'https://analytics-us.tabit.cloud/chef/handler.ashx'
    },
    olapConfig: {//IL PROD CUBE
        baseUrl: 'https://analytics-dev.tabit.cloud/proxyV2/il-prod/proxy.ashx',
        sqlServerProxy: 'https://analytics-dev.tabit.cloud/olapproxy/handler.ashx',
        catalog: 'isrProd',
        cube: 'tlogs',
    },
    translationBaseUrl: './assets/i18n/'
};
