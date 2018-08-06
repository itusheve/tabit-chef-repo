export const environment = {
    production: false,
    managerDashboardMode: false,
    region: 'il',
    tbtLocale: 'he-IL',//
    rosConfig: {//IL 'BETA' 'REPORTS'
        // baseUrl: 'https://inpact-int.herokuapp.com/',
        baseUrl: 'https://ros-rp-beta.tabit.cloud/'//BETA
        // baseUrl: 'https://ros-report-prd.herokuapp.com/'//PROD
    },
    olapConfig: {//IL PROD CUBE
        baseUrl: 'https://analytics-dev.tabit.cloud/proxyV2/il-prod/proxy.ashx',
        sqlServerProxy: 'https://analytics-dev.tabit.cloud/olapproxy/handler.ashx',
        catalog: 'isrProd',
        cube: 'tlogs',
    }
};
