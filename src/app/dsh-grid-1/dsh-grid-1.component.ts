import { Component, OnInit } from '@angular/core';
import { DataService } from '../shared/data.service';

@Component({
  selector: 'app-dsh-grid-1',
  templateUrl: './dsh-grid-1.component.html',
  styleUrls: ['./dsh-grid-1.component.css'],
  providers: [DataService]
})
export class DshGrid1Component implements OnInit {

  customers = [
    {
      "ID": 1,
      "CompanyName": "Super Mart of the West",
      "City": "Bentonville",
      "State": "Arkansas"
    },
    {
      "ID": 2,
      "CompanyName": "Electronics Depot",
      "City": "Atlanta",
      "State": "Georgia"
    },
    {
      "ID": 3,
      "CompanyName": "K&S Music",
      "City": "Minneapolis",
      "State": "Minnesota"
    },
    {
      "ID": 4,
      "CompanyName": "Tom's Club",
      "City": "Issaquah",
      "State": "Washington"
    },
    {
      "ID": 5,
      "CompanyName": "E-Mart",
      "City": "Hoffman Estates",
      "State": "Illinois"
    }
  ];

  dxGrid = {
    data: undefined,
    show: false
  };

  constructor(private dataService: DataService) {

  }

  ngOnInit() {
    this.dataService.getGridData()
      .then(rowset=>{
        this.dxGrid.data = rowset;
        this.dxGrid.show = true;
      })
  }

}
