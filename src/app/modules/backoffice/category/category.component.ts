import { Component, OnInit } from '@angular/core';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GridColumnType, StatusTypes } from '@enums';
import { UtilityService, ConfigService, ToasterService } from '@shared';
import { CategoryService } from './category.service';
import { LinksRenderComponent } from '../../shared/components';
import { Statuses } from 'src/app/enums/const';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {


  gridOptions: GridOptions;
  BulkEdit = [
    { label: "Active", value: true },
    { label: "In Active", value: false },
    { label: "Delete", value: true },
  ]




  get isEditButtonEnable() {
    if (this.gridOptions) {
      const rows = this.gridOptions.api?.getSelectedRows();
      return rows && rows.length > 0;
    }
    return false;
  }

  get selectedCategory() {
    if (this.gridOptions) {
      const rows = this.gridOptions.api?.getSelectedRows();
      if (rows && rows.length == 1)
        return rows[0].categoryId
    }
    return false;
  }


  constructor(private utils: UtilityService,
    private configService: ConfigService,
    private categoryService: CategoryService,
    private toasterService: ToasterService) {
    this.initGridConfig();
    this.getGridData();
  }

  ngOnInit(): void {
  }

  onActionApply(action: String) {
    switch (action) {
      case Statuses.active:
        this.onStatusUpdate(true);
        break;
      case Statuses.inactive:
        this.onStatusUpdate(false);
        break;
      case Statuses.delete:
        this.onDeleteCategory(true);
        break;
    }
  }


  private getGridData() {
    this.toggleGridOverlay(true)
    this.categoryService.getListOfCategories().subscribe(response => {
      this.utils.setGridData(this.gridOptions, response);
      this.toggleGridOverlay()
    }, (error) => {
      console.log(error);
      this.toggleGridOverlay()
      this.toasterService.error(error)
    })
  }


  private initGridConfig() {
    this.gridOptions = this.configService.getGridConfig(false, true);
    this.gridOptions.columnDefs = this.getGridColumnDefs();
    this.gridOptions.onRowDragEnd = this.onDropRow.bind(this);
    this.gridOptions.pagination = true;
    this.gridOptions.rowDragEntireRow = true;
    this.gridOptions.rowDragManaged = true;
    this.gridOptions.animateRows = true;
    this.gridOptions.paginationPageSize = 10;
    this.gridOptions.enableCellTextSelection = false;
    this.gridOptions.onPaginationChanged = this.onPageChange.bind(this);
    this.gridOptions.onGridReady = params => {
      params.api.sizeColumnsToFit();
    }
  }

  private onPageChange = (params: GridOptions) => {
  }

  private onDropRow(params: any) {
    if (params.overIndex == -1 || params.overIndex == params.overNode.rowIndex)
      return;
  }


  private getGridColumnDefs(): Array<ColDef> {
    const headerColumn = this.configService.getCheckboxConfig();
    headerColumn.headerClass = 'header_one';
    return [
      {
        ...headerColumn
      },
      {
        headerName: '',
        field: '',
        headerClass: 'header_one',
        cellClass: "text-center",
        sortable: false,
        width: 10,
        maxWidth: 100,
        cellRenderer: () => {
          return `<span class='fa fa-bars'></span>`
        }
      }, {
        headerName: 'Status',
        headerClass: 'header_one',
        field: 'status',
        editable: true,
        sortable: true,
        comparator: (valueA, valueB) => (valueA == valueB) ? 0 : (valueA > valueB) ? 1 : -1,
        valueGetter: (params) => params.data.active ? 'Active' : 'In Active',
        onCellValueChanged: (params) => {
          if (params.newValue != params.oldValue)
            this.onStatusUpdate(params);
        },
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: (params) => {
          let statusTypes = StatusTypes;
          return { values: statusTypes.map(({ value }) => value) };
        },
        cellRenderer: (params) => {
          return `<span class='badge-item badge-status w-100'>${params.value || ''}</span>`
        },
        maxWidth: 150
      },
      {
        headerName: 'Category Name',
        field: 'categoryName',
        headerClass: 'header_one',
        cellClass: "text-center",
        sortable: false,
        width: 100,
      }, {
        headerName: 'Date',
        field: 'modifyDate',
        cellClass: "text-center",
        headerClass: 'header_one',
        sortable: false,
        width: 100,
        type: GridColumnType.dateTime
      }, {
        headerName: 'Actions',
        field: 'Links',
        cellClass: "text-center pl-2 pr-0",
        headerClass: 'header_one  pl-2 pr-0',
        cellRendererFramework: LinksRenderComponent,
        sortable: false,
        width: 100,
      }];
  }

  private toggleGridOverlay(showLoading: boolean = false): void {
    this.utils.toggleGridOverlay(this.gridOptions, showLoading)
  }

  private onStatusUpdate(value: any): void {
    let rows = this.gridOptions.api?.getSelectedRows();
    rows = rows.filter(elm => elm.active = value);
    // let data = new Category(rows[0]);
    // console.log(data);

  }

  private onDeleteCategory(value: boolean) {
    let rows = this.gridOptions.api?.getSelectedRows();
    rows = rows.filter(elm => elm.isDeleted = value);
    if (rows && rows.length > 0) {
      this.categoryService.onDeleteCategory(rows[0]).subscribe(response => {
        this.getGridData();
      })
    }
  }

}
