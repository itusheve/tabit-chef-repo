export const environment = {
    production: true,
    managerDashboardMode: false,
    region: 'us',
    tbtLocale: 'en-US',
    lang: 'en',
    rosConfig: {//US 'PROD' 'REPORTS'
        baseUrl: 'https://us-ros-rp.tabit.cloud/'
    },
    olapConfig: {//US PROD CUBE
        baseUrl: 'https://analytics-us.tabit.cloud/olapproxy/proxy.ashx',
        sqlServerProxy: 'https://analytics-us.tabit.cloud/olapproxy/handler.ashx',
        catalog: 'usaProd',
        cube: 'tlogs',
    }
};
