import {
  Component,
  ViewChild,
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/core";
import {
  NavController,
  NavParams,
  PopoverController,
  Content
} from "ionic-angular";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { ImagesService } from "../../services/images.service";
import { RecipeEntity } from "../../entities/recipe-entity";
import { CameraPopoverComponent } from "../../components/camera-popover/camera-popover";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "page-recipe-management",
  templateUrl: "recipe-management.html",
  providers: [ImagesService],
  animations: [
    trigger("resizeImg", [
      state(
        "shrink",
        style({
          "padding-bottom": "30vh"
        })
      ),
      state(
        "expand",
        style({
          "padding-bottom": "100vh"
        })
      ),
      transition("shrink => expand", animate("300ms ease-in")),
      transition("expand => shrink", animate("300ms ease-out"))
    ])
  ]
})
export class RecipeManagementPage {
  public base64ImageUrl: string;
  public recipe: RecipeEntity;
  public dynamicHeight: number;
  public imgState: string;

  @ViewChild(Content) content: Content;

  private cameraOptions: CameraOptions = {
    quality: 60,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true,
    destinationType: this.camera.DestinationType.DATA_URL,
    cameraDirection: this.camera.Direction.BACK
  };

  private fileOptions: CameraOptions = {
    quality: 60,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    destinationType: this.camera.DestinationType.DATA_URL,
    cameraDirection: this.camera.Direction.BACK
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    private popoverCtrl: PopoverController,
    private imagesService: ImagesService,
    private sanitizer: DomSanitizer
  ) {
    this.recipe = this.navParams.get("entity");
    this.dynamicHeight = 100;
    this.imgState = "expand";
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad RecipeManagementPage");
  }

  getBackground(image) {
    return this.sanitizer.bypassSecurityTrustStyle(`url(${image})`);
  }

  public makeScreenshot() {
    this.camera.getPicture(this.cameraOptions).then(
      imageData => {
        this.imagesService.save(imageData).then(res => {
          this.base64ImageUrl = res;
        });
      },
      err => {
        // Handle error
      }
    );
  }

  presentPopover(event) {
    let popover = this.popoverCtrl.create(CameraPopoverComponent);
    popover.present({ ev: event });
  }

  onSwipeUp(event) {
    this.imgState = "shrink";
  }

  onSwipeDown(event) {
    this.imgState = "expand";
  }
}
