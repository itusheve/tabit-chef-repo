export const environment = {
    production: false,
    managerDashboardMode: false,
    region: 'us',
    tbtLocale: 'en-US',
    lang: 'en',
    rosConfig: {//US 'PROD' 'REPORTS'
        baseUrl: 'https://ros-rp-beta.tabit.cloud/'//BETA
    },
    olapConfig: {//US PROD CUBE
        baseUrl: 'https://analytics-dev.tabit.cloud/proxyV2/il-prod/proxy.ashx',
        sqlServerProxy: 'https://analytics-dev.tabit.cloud/proxyV2/authTest/handler.ashx',
        catalog: 'isrProd',
        cube: 'tlogs',
    }
};
