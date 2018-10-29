export const environment = {
    production: false,
    managerDashboardMode: false,
    region: 'us',
    tbtLocale: 'en-US',
    lang: 'en',
    rosConfig: {//US 'PROD' 'REPORTS'
        baseUrl: 'https://us-ros-rp.tabit.cloud/'
    },
    olapConfig: {//US PROD CUBE
        baseUrl: 'https://analytics-dev.tabit.cloud/proxyV2/il-prod/proxy.ashx',
        sqlServerProxy: 'https://analytics-us.tabit.cloud/olapproxy/handler.ashx',
        catalog: 'isrProd',
        cube: 'tlogs',
    }
};
