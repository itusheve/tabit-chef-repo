const Xmla4JWrapper = (function(){
    // this wrapper submodule abstracts some xmla4j lib stuff, and also converts complex results into a proper row set
    function Xmla4j_wrapper({ url, catalog } = opt) {
        this.url = url;
        this.catalog = catalog;
        this.resolve;
        this.reject;
    }

    Xmla4j_wrapper.prototype._successHandler = function (xmla, xmlaRequest, xmlaResponse) {
        const fieldsMap = {};

        Object.keys(xmlaResponse.fields).forEach(name => {
            const uglyName = xmlaResponse.fields[name].name;
            const jsType = xmlaResponse.fields[name].jsType;
            fieldsMap[uglyName] = {
                name: name,
                jsType: jsType
            }
        })

        const rows = xmlaResponse._rows.map(oldRow => {
            const newRow = {};
            if (oldRow.childNodes) {
                oldRow.childNodes.forEach(childNode => {
                    const key = fieldsMap[childNode.nodeName];                    
                    newRow[key.name] = childNode.hasOwnProperty('childNodes') ? childNode.childNodes[0].data : undefined;
                })
            }
            return newRow;
        })

        this.resolve(rows);
    }

    Xmla4j_wrapper.prototype._successHandlerNew = function (xmla, xmlaRequest, XmlaRowset) {
        this.resolve(XmlaRowset.fetchAllAsObject());
    }

    Xmla4j_wrapper.prototype._errorHandler = function (xmla, xmlaRequest, exception) {
        if (exception.code === 'XMLAnalysisError.0xc10a00b8') {
            this.reject({ type: 'cantDetailCalculatedField', message: 'Cant detail a calculated field' })
        } else {
            this.reject({ type: 'XMLAnalysisUnhandledError' })
        }
    }

    Xmla4j_wrapper.prototype.execute = function (query) {
        let that = this;

        this.promise = new Promise((resolve, reject)=>{
            that.resolve = resolve;
            that.reject = reject;

            const xmla = new Xmla();
            xmla.executeTabular({
                url: this.url,
                statement: query,
                properties: {
                    Catalog: this.catalog,
                    Timeout: 3600
                },
                async: true,
                success: function () { that._successHandler.apply(that, arguments) },
                error: function () { that._errorHandler.apply(that, arguments) },
            });
        })


        //return this.deferred.promise;
        return this.promise;
    }

    Xmla4j_wrapper.prototype.executeNew = function (query) {
        let that = this;

        this.promise = new Promise((resolve, reject) => {
            that.resolve = resolve;
            that.reject = reject;

            const xmla = new Xmla();
            xmla.executeTabular({
                url: this.url,
                statement: query,
                properties: {
                    Catalog: this.catalog,
                    Timeout: 3600
                },
                async: true,
                success: function () { that._successHandlerNew.apply(that, arguments) },
                error: function () { that._errorHandler.apply(that, arguments) },
            });
        })


        //return this.deferred.promise;
        return this.promise;
    }

    return Xmla4j_wrapper;
}());