export const environment = {
    production: true,
    managerDashboardMode: false,
    region: 'us',
    tbtLocale: 'en-US',
    lang: 'en',
    rosConfig: {
        il: 'https://ros-rp-beta.tabit.cloud/',
        us: 'https://us-ros-rp.tabit.cloud/'
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
