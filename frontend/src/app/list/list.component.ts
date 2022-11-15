import { Component, OnInit, ViewChild } from '@angular/core';
import {gql, Apollo} from 'apollo-angular';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { IFiles } from '../model/file.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';

const getFiles = gql`
query GetFilepathContent($filepath: String!) {
  getDirContent(filepath: $filepath){
    isDirectory
    filename
    filepath
    size
    type
    createdDate
    permissions {
      readPermissions
      writePermissions
      executePermissions
    }
  }
}
`;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ListComponent implements OnInit {
  displayedColumns = ['filename', 'filepath', 'size', 'createdDate', 'permissions', 'type']
  displayedData = ['isDirectory', 'filename', 'filepath', 'size', 'createdDate']
  search: string =""
  selectedRowIndex: boolean = false
  error: any

  showTable: boolean = false;
  loading: boolean = true;

  expandedElement: IFiles[] = [];

  dataSource!: MatTableDataSource<IFiles>
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private apollo: Apollo, private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {

  }

  checkExpanded(element: IFiles): boolean {
    let flag = false;
    this.expandedElement.forEach(e => {
      if(e === element) {
        flag = true;
      }
    });
    return flag;
  }

  pushPopElement(element: IFiles) {
    const index = this.expandedElement.indexOf(element);
    console.log(index);
    if(index === -1) {
        this.expandedElement.push(element);
    } else {
      this.expandedElement.splice(index,1);
    }
  }

  getDir(path: string) {
    if (!path) {
      this._snackBar.open("Please provide file path!", "Close", {duration: 2000});
      return;
    }
    this.apollo.watchQuery<any>({
      query: getFiles,
      variables: {
        filepath: path
      }
    })
    .valueChanges
    .subscribe(({data, loading}) => {
      this.dataSource = new MatTableDataSource(data.getDirContent)
      this.dataSource.paginator = this.paginator;
      this.showTable = !this.showTable;
      this._snackBar.open("Click on files to view details", "Close",  {duration: 5000});
      this.loading = loading;
    },
    (err) => {
      this.error = err
      if (err.message.includes('no such file or directory')) {
        this._snackBar.open("This path does not exist!", "Close",  {duration: 2000});
        return
      }
      else {
        this._snackBar.open(`${this.error}`, "Close",  {duration: 2000});
      }
    })
  }

  enterDir(row: IFiles){
    if(row.isDirectory === true) {
      this.showTable = !this.showTable;
      this.getDir(row.filepath);
    }
  }

  clearClick() {
    this.search = ""
    this.showTable = false;
    this.loading = true
  };

}
