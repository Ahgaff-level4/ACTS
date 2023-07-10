import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-file-manager[personId]',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent implements OnInit {
  public view: any;
  @Input() personId!: number;
  public ajaxSettings:any;
  public rootAliasName!:string;
  public toolbarSettings: any;
  public contextMenuSettings: any;
  ngOnInit(): void {
    this.ajaxSettings = {
      url: environment.API + 'person/' + this.personId + '/file-manager/FileOperations',
      downloadUrl: environment.API + 'person/' + this.personId + '/file-manager/Download',
      uploadUrl: environment.API + 'person/' + this.personId + '/file-manager/Upload',
      getImageUrl: environment.API + 'person/' + this.personId + '/file-manager/GetImage',
    };

    this.rootAliasName = 'Files';

    this.toolbarSettings = { items: ['NewFolder', 'SortBy', 'Cut', 'Copy', 'Paste', 'Delete', 'Refresh', 'Download', 'Rename', 'Selection', 'View', 'Details',] };

    this.contextMenuSettings = {
      layout: ['Upload','|','SortBy', 'View', 'Refresh', '|', 'Paste', '|', 'NewFolder', '|', 'Details', '|', 'SelectAll'],
      visible: true
    };
  }

}
