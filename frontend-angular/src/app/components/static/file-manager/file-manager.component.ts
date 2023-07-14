import { Component, Input, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { environment } from 'src/environments/environment';
import { enableRtl, L10n } from '@syncfusion/ej2-base'
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-file-manager[personId]',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent extends UnsubOnDestroy implements OnInit {
  public view: any;
  @Input() personId!: number;
  public ajaxSettings: any;
  public rootAliasName!: string;
  public toolbarSettings: any;
  public contextMenuSettings: any;

  constructor(public ut: UtilityService, private translateService: TranslateService) { super(); }
  ngOnInit(): void {
    enableRtl(this.ut.currentLang == 'ar');
    this.rootAliasName = this.ut.translate('Child Folder');
    this.sub.add(this.translateService.onLangChange.subscribe(v => {
      enableRtl(v.lang.includes('ar'))
      this.rootAliasName = this.ut.translate('Child Folder');
    }));
    this.ajaxSettings = {
      url: environment.API + 'person/' + this.personId + '/file-manager/FileOperations',
      downloadUrl: environment.API + 'person/' + this.personId + '/file-manager/Download',
      uploadUrl: environment.API + 'person/' + this.personId + '/file-manager/Upload',
      getImageUrl: environment.API + 'person/' + this.personId + '/file-manager/GetImage',
    };


    this.toolbarSettings = { items: ['NewFolder', 'SortBy', 'Cut', 'Copy', 'Paste', 'Delete', 'Refresh', 'Download', 'Rename', 'Selection', 'View', 'Details',], visible: true };

    this.contextMenuSettings = {
      layout: ['Upload', '|', 'SortBy', 'View', 'Refresh', '|', 'Paste', '|', 'NewFolder', '|', 'Details', '|', 'SelectAll'],
      visible: true
    };

    L10n.load({
      'ar': {
        'filemanager': {
          "NewFolder": "مجلد جديد",
          "Upload": "رفع",
          "Delete": "حذف",
          "Rename": "إعادة التسمية",
          "Download": "تحميل",
          "Cut": "قص",
          "Copy": "نسخ",
          "Paste": "لصق",
          "SortBy": "ترتيب بحسب",
          "Refresh": "تحديث",
          "Item-Selection": "عنصر محدد",
          "Items-Selection": "عناصر محددة",
          "View": "عرض",
          "Details": "تفاصيل",
          "SelectAll": "تحديد الكل",
          "Open": "فتح",
          "Tooltip-NewFolder": "مجلد جديد",
          "Tooltip-Upload": "رفع",
          "Tooltip-Delete": "حذف",
          "Tooltip-Rename": "إعادة التسمية",
          "Tooltip-Download": "تحميل",
          "Tooltip-Cut": "قص",
          "Tooltip-Copy": "نسخ",
          "Tooltip-Paste": "لصق",
          "Tooltip-SortBy": "ترتيب بحسب",
          "Tooltip-Refresh": "تحديث",
          "Tooltip-Selection": "تحرير التحديد",
          "Tooltip-View": "عرض",
          "Tooltip-Details": "تفاصيل",
          "Tooltip-SelectAll": "تحديد الكل",
          "Name": "الاسم",
          "Size": "الحجم",
          "DateModified": "تاريخ التعديل",
          "DateCreated": "تاريخ الإنشاء",
          "Path": "المسار",
          "Modified": "عُدِل",
          "Created": "اُنشِئ",
          "Location": "الموقع",
          "Type": "النوع",
          "Permission": "الصلاحية",
          "Ascending": "تصاعدي",
          "Descending": "تنازلي",
          "None": "لا شيء",
          "View-LargeIcons": "عرض الايقونات كبيرة",
          "View-Details": "عرض التفاصيل",
          "Search": "بحث",
          "Button-Ok": "حسنًا",
          "Button-Cancel": "إلغاء",
          "Button-Yes": "نعم",
          "Button-No": "لا",
          "Button-Create": "إنشاء",
          "Button-Save": "حفظ",
          "Header-NewFolder": "مجلد",
          "Content-NewFolder": "ادخل اسم المجلد",
          "Header-Rename": "إعادة التسمية",
          "Content-Rename": "ادخل الاسم الجديد",
          "Header-Rename-Confirmation": "تأكيد إعادة التسمية",
          "Content-Rename-Confirmation": "إذا قمت بتغيير إمتداد الملف، فقد يصبح الملف غير مستقر. هل أنت متأكد أنك تريد تغييره؟",
          "Header-Delete": "حذف ملف",
          "Content-Delete": "هل أنت متأكد أنك تريد حذف هذا الملف؟",
          "Header-Multiple-Delete": "حذف عدة ملفات",
          "Content-Multiple-Delete": "هل أنت متأكد أنك تريد حذف هذه {0} الملفات؟",
          "Header-Folder-Delete": "حذف مجلد",
          "Content-Folder-Delete": "هل أنت متأكد أنك تريد حذف هذا المجلد؟",
          "Header-Duplicate": "الملف متكرر",
          "Content-Duplicate": "{0} موجود. هل أنت متأكد أنك تريد استبداله؟",
          "Header-Upload": "رفع ملفات",
          "Error": "خطأ",
          "Validation-Empty": "لا يمكن أن يكون اسم الملف أو المجلد فارغًا.",
          "Validation-Invalid": "يحتوي اسم الملف أو المجلد {0} على أحرف غير صالحة. الرجاء استخدام اسم مختلف. لا يمكن أن تنتهي أسماء الملفات أو المجلدات الصالحة بنقطة أو مسافة ، ولا يمكن أن تحتوي على أي من الأحرف التالية:  \\ /: *? \" < > | ",
          "Validation-NewFolder-Exists": "يوجد بالفعل ملف أو مجلد باسم {0}.",
          "Validation-Rename-Exists": "لا يمكن إعادة تسمية {0} إلى {1} الاسم موجود في الوجهة بالفعل.",
          "Folder-Empty": "هذا المجلد فارغ",
          "File-Upload": "اسحب الملفات هنا للتحميل",
          "Search-Empty": "لم يتم العثور على نتائج",
          "Search-Key": "حاول بكلمات مفتاحية مختلفة",
          "Filter-Empty": "لم يتم العثور على نتائج",
          "Filter-Key": "حاول بتصفية مختلفة",
          "Sub-Folder-Error": "مجلد الوجهة هو المجلد الفرعي للمجلد المصدر",
          "Same-Folder-Error": "مجلد الوجهة هو نفس مجلد المصدر.",
          "Access-Denied": "رُفِض الوصول",
          "Access-Details": "ليس لديك إذن للوصول إلى هذا المجلد",
          "Header-Retry": "الملف موجود بالفعل",
          "Content-Retry": "يوجد ملف بهذا الاسم بالفعل في هذا المجلد. ماذا تريد ان تفعل؟",
          "Button-Keep-Both": "احتفظ بكليهما",
          "Button-Replace": "تبديل",
          "Button-Skip": "تخطي",
          "ApplyAll-Label": "افعل هذا لجميع العناصر الحالية",
          "KB": "كيلو بايت",
          "Access-Message": "{0} لا يمكن الوصول إليه. أنت بحاجة إلى إذن لتنفيذ الإجراء {1}.",
          "Network-Error": "خطأ في الشبكة: فشل في الإرسال على XMLHTTPRequest: فشل التحميل",
          "Server-Error": "خطأ في السيرفر: رد غير صالحة"
        }
      }
    });
  }

}
