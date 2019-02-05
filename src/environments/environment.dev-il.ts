export const environment = {
    production: false,
    managerDashboardMode: false,
    region: 'il',
    tbtLocale: 'he-IL',
    lang: 'he',
    rosConfig: {
        il: 'https://ros-rp-beta.tabit.cloud/',
        us: 'https://us-ros-beta.tabit.cloud/'
    },
    remoteDatabases: {
        il: 'https://analytics-dev.tabit.cloud/chef/handler.ashx',
        us: 'https://analytics-us.tabit.cloud/chef/handler.ashx'
    },
    olapConfig: {//US PROD CUBE
        baseUrl: 'https://analytics-us.tabit.cloud/olapproxy/proxy.ashx',
        sqlServerProxy: 'https://analytics-us.tabit.cloud/olapproxy/handler.ashx',
        catalog: 'usaProd',
        cube: 'tlogs',
    },
    translationBaseUrl: 'http://chef.tabit-dev.com/assets/i18n/'
};
