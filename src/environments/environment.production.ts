export const environment = {
    production: false,
    managerDashboardMode: false,
    region: 'il',
    tbtLocale: 'he-IL',
    environment: 'prod',
    lang: 'he',
    rosConfig: {
        il: 'https://ros-rp-beta.tabit.cloud/',
        us: 'https://us-ros-beta.tabit.cloud/'
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

    translationBaseUrl: 'https://chef.tabit-dev.com/assets/i18n/',
    reportingServer: {
        url: 'https://prd-azure.tabit.cloud/dwh/il/'
    },
};
