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
  public ajaxSettings = this.getAjaxSettings();

  ngOnInit(): void {
    this.ajaxSettings = this.getAjaxSettings();
  }

  private getAjaxSettings(): { url: string, downloadUrl: string, uploadUrl: string, getImageUrl: string } {
    return {
      url: environment.API + 'person/' + this.personId + '/file-manager/FileOperations',
      downloadUrl: environment.API + 'person/' + this.personId + '/file-manager/Download',
      uploadUrl: environment.API + 'person/' + this.personId + '/file-manager/Upload',
      getImageUrl: environment.API + 'person/' + this.personId + '/file-manager/GetImage',
    };
  }
}
