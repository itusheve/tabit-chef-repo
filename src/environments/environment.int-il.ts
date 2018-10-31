export const environment = {
    production: true,
    managerDashboardMode: false,
    region: 'il',
    tbtLocale: 'he-IL',//
    rosConfig: {//IL 'BETA' 'REPORTS'
        // baseUrl: 'https://inpact-int.herokuapp.com/',
        baseUrl: 'https://il-int-ros.tabit-stage.com/'//BETA
        // baseUrl: 'https://ros-report-prd.herokuapp.com/'//PROD
    },
    rosConfig: {
        il: 'https://ros-rp-beta.tabit.cloud/',
        us: 'https://us-ros-rp.tabit.cloud/'
    },
    remoteDatabases: {
        il: 'https://analytics-dev.tabit.cloud/olapproxy/handler.ashx',
        us: 'https://analytics-us.tabit.cloud/olapproxy/handler.ashx'
    },
    olapConfig: {//IL PROD CUBE
        baseUrl: 'https://analytics-dev.tabit.cloud/proxyV2/il-int/proxy.ashx',
        sqlServerProxy: 'https://analytics-dev.tabit.cloud/olapproxy/handler.ashx',
        catalog: 'isrProd',
        cube: 'tlogs',
    }
};