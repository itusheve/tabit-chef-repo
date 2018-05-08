import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ROSEp } from '../ep/ros.ep';

import * as _ from 'lodash';
import { DebugService } from '../../../app/debug.service';

@Injectable()
export class CategoriesDataService {

    /*

    */
    public categories$: Observable<any> = new Observable(obs => {

        function sortCategoryTree(node) {
			/**
			 * comparison function used to sort first by index and then by name
			 * @param a
			 * @param b
			 * @returns {number}
			 */
            function comparator(a, b) {
                const indexA = a.index ? a.index : 0;
                const indexB = b.index ? b.index : 0;
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                if (indexA < indexB) return -1;
                if (indexA > indexB) return 1;
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            }

            if (node.children) {
                node.children = node.children.sort(comparator);
                node.children.forEach(child => {
                    sortCategoryTree(child);
                });
            }
            return node;
        }


        this.rosEp.get('menu/categories', {})
            .then((categoriesRaw: {}[]) => {

                //public\l10n\he - IL.json
                const ALLITEMS = 'כל הפריטים';
                //sortCategoryTree({ name: $translate.instant('ALLITEMS'), children: result.data })
                const categoriesTreeRaw = sortCategoryTree({ name: ALLITEMS, children: categoriesRaw });

                // let mainCategoriesRaw;//TODO mainCategories looks like maybe it is never used. categoriesTree is an obj and not array. behaves weird.
                // _.each(categoriesTreeRaw, function (category) {
                //     _.each(category.children, function (department) {
                //         if (department.dishRole === 'Main') {
                //             mainCategoriesRaw = _.deepClone(department.children);
                //         }
                //     });
                // });

                obs.next({
                    categoriesTreeRaw: categoriesTreeRaw
                    // mainCategoriesRaw: mainCategoriesRaw
                });
            });
    }).publishReplay(1).refCount();

    constructor(
        private rosEp: ROSEp,
        private ds: DebugService
    ) {

    }

}
