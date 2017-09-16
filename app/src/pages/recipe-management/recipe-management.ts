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
  Content,
  Haptic
} from "ionic-angular";
import {
  RecipeEntity,
  Ingredients,
  Instruction
} from "../../entities/recipe-entity";
import { CameraPopoverComponent } from "../../components/camera-popover/camera-popover";
import { DomSanitizer } from "@angular/platform-browser";
import { DeviceFeedback } from "@ionic-native/device-feedback";

@Component({
  selector: "page-recipe-management",
  templateUrl: "recipe-management.html",
  animations: [
    trigger("resizeImg", [
      state(
        "shrink",
        style({
          "padding-bottom": "100px"
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
  public imgState: string;
  public editMode: boolean;
  public inputRef: string;
  public recipeContent: string;
  public selectedIngredient: Ingredients;
  public selectedInstruction: Instruction;

  private swipeCoord?: [number, number];
  private swipeTime?: number;

  @ViewChild(Content) content: Content;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private popoverCtrl: PopoverController,
    private sanitizer: DomSanitizer,
    private haptic: Haptic,
    private deviceFeedback: DeviceFeedback
  ) {
    this.recipeContent = "ingredients";
    this.recipe = this.navParams.get("entity");
    this.imgState = "shrink";
    this.editMode = false;
  }

  ionViewDidLoad() {}

  getBackground(image) {
    return this.sanitizer.bypassSecurityTrustStyle(`url(${image})`);
  }

  presentPopover(event) {
    let popover = this.popoverCtrl.create(CameraPopoverComponent, {
      recipe: this.recipe
    });
    popover.present({ ev: event });
  }

  toggleMode(mode: boolean) {
    this.editMode = mode;
    this.haptic.selection(); //iOs
    this.deviceFeedback.haptic(1); // Android
  }

  showInput(mode, input) {
    this.toggleMode(mode);
    this.inputRef = input;
  }

  edit(item: any, itemType: string) {
    this.inputRef = itemType;
    this.toggleMode(true);
    if (itemType == "ingredients") {
      this.selectedIngredient = item;
    } else {
      this.selectedInstruction = item;
    }
  }

  add(itemType: string) {
    let item: any;
    if (itemType == "ingredients") {
      item = new Ingredients("", null, "");
      this.recipe.ingredients.push(item);
    } else {
      item = new Instruction(null, "");
      this.recipe.instructions.push(item);
    }
    this.edit(item, itemType);
  }

  delete(item: any, itemType: string) {
    if (itemType == "ingredients") {
      let index: number = this.recipe.ingredients.indexOf(item, 0);
      if (index > -1) {
        this.recipe.ingredients.splice(index, 1);
      }
    } else {
      let index: number = this.recipe.instructions.indexOf(item, 0);
      if (index > -1) {
        this.recipe.instructions.splice(index, 1);
      }
    }
  }

  swipe(e: TouchEvent, when: string): void {
    const coord: [number, number] = [
      e.changedTouches[0].pageX,
      e.changedTouches[0].pageY
    ];
    const time = new Date().getTime();

    if (when === "start") {
      this.swipeCoord = coord;
      this.swipeTime = time;
    } else if (when === "end") {
      const direction = [
        coord[0] - this.swipeCoord[0],
        coord[1] - this.swipeCoord[1]
      ];
      const duration = time - this.swipeTime;

      if (
        duration < 1000 && //Short enough
        Math.abs(direction[0]) < Math.abs(direction[1]) && //Vertical enough
        Math.abs(direction[1]) > 10
      ) {
        //Long enough
        const swipe = direction[1] < 0 ? "up" : "down";

        if (swipe == "up") {
          this.imgState = "shrink";
        } else {
          this.imgState = "expand";
        }
      }
    }
  }
}
