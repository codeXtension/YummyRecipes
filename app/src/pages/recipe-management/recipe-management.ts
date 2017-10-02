import {Component, ViewChild,} from "@angular/core";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {
    Content,
    Events,
    Haptic,
    Loading,
    LoadingController,
    NavController,
    NavParams,
    Popover,
    PopoverController,
    Toast,
    ToastController
} from "ionic-angular";
import {Ingredient, RecipeEntity} from "../../entities/recipe-entity";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CameraPopoverComponent} from "../../components/camera-popover/camera-popover";
import {DomSanitizer} from "@angular/platform-browser";
import {DeviceFeedback} from "@ionic-native/device-feedback";
import {ImagesService} from "../../services/images.service";
import {Neo4JService} from "../../services/neo4j.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: "page-recipe-management",
    templateUrl: "recipe-management.html",
    providers: [ImagesService, Neo4JService],
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
    public recipe: RecipeEntity;
    public imgState: string;
    public editMode: boolean;
    public inputMode: boolean;
    public inputRef: string;
    public recipeContent: string;
    public recipeForm: FormGroup;
    @ViewChild(Content) content: Content;
    private actionMode: EditModeType;
    private swipeCoord?: [number, number];
    private swipeTime?: number;
    private popover: Popover;
    private toast: Toast;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public events: Events,
                private loadingCtrl: LoadingController,
                private popoverCtrl: PopoverController,
                private sanitizer: DomSanitizer,
                private haptic: Haptic,
                private deviceFeedback: DeviceFeedback,
                private formBuilder: FormBuilder,
                private imagesService: ImagesService,
                private neo4jService: Neo4JService,
                private toastCtrl: ToastController,
                private translate: TranslateService) {
        this.recipeContent = "ingredients";
        let tempRecipe: RecipeEntity = this.navParams.get("entity");
        let tempInstructions: string[] = [];
        tempInstructions = tempInstructions.concat(tempRecipe.instructions);
        let tempIngredients: Ingredient[] = [];
        tempIngredients = tempIngredients.concat(tempRecipe.ingredients);
        this.recipe = new RecipeEntity(tempRecipe.id, tempRecipe.name, tempRecipe.duration, tempRecipe.notes, tempRecipe.favourite, tempRecipe.tags, tempInstructions, tempIngredients, tempRecipe.imageUrl, tempRecipe.servings);
        this.imgState = "shrink";
        this.inputMode = false;
        this.editMode = this.navParams.get("editMode") || false;

        this.popover = this.popoverCtrl.create(CameraPopoverComponent, {
            recipe: this.recipe
        });

        this.popover.onDidDismiss((data, role) => {
            if (data != null) {
                this.recipe.imageUrl = data;
            }
        });

        this.toast = this.toastCtrl.create({
            duration: 2000,
            position: "top"
        });
    }

    ionViewDidLoad() {
    }

    getBackground(image) {
        return this.sanitizer.bypassSecurityTrustStyle(`url(${image})`);
    }

    presentPopover(event) {
        this.popover.present({ev: event});
    }

    toggleMode(mode: boolean) {
        this.inputMode = mode;
        this.haptic.selection(); //iOs
        this.deviceFeedback.haptic(1); // Android
    }

    onSwipe(event: any, item: any, input: string, mode: EditModeType) {
        if (event._openAmount < -100) {
            //right
            this.showInput(item, input, mode);
        } else if (event._openAmount > 100) {
            //left
            this.delete(item[0], input);
        }
    }

    showInput(item: any, input: string, mode: EditModeType) {
        this.toggleMode(true);
        this.inputRef = input;
        this.actionMode = mode;

        switch (input) {
            case "name": {
                this.recipeForm = this.formBuilder.group({
                    name: [item, Validators.required]
                });
                break;
            }
            case "duration": {
                this.recipeForm = this.formBuilder.group({
                    duration: [item, Validators.required]
                });
                break;
            }
            case "servings": {
                this.recipeForm = this.formBuilder.group({
                    servings: [item, Validators.required]
                });
                break;
            }
            case "ingredients": {
                this.recipeForm = this.formBuilder.group({
                    name: [item[0].name, Validators.required],
                    quantity: [item[0].quantity],
                    unit: [item[0].unit],
                    id: [item[0].id == null ? new Date().getTime() : item[0].id]
                });
                break;
            }
            case "instructions": {
                this.recipeForm = this.formBuilder.group({
                    order: [item[1]],
                    description: [item[0], Validators.required]
                });
                break;
            }
            case "notes": {
                this.recipeForm = this.formBuilder.group({
                    notes: item
                });
            }
        }
    }

    edit() {
        this.haptic.selection(); //iOs
        this.deviceFeedback.haptic(1);

        this.editMode = !this.editMode;
    }

    async save() {
        let saving_wait = await this.getTranslation("SAVING_WAIT");
        let loading: Loading = this.loadingCtrl.create({content: saving_wait});
        loading.present();
        if (
            this.recipe.imageUrl.indexOf("no_image.jpg") > -1 ||
            this.recipe.imageUrl.startsWith("http")
        ) {
            this.neo4jService.saveRecipe(this.recipe).then(v => {
                this.showToast("DATA_SAVED");
                this.editMode = false;
                this.toggleMode(false);
                loading.dismissAll();
                this.events.publish("recipe:saved", this.recipe);
            }).catch(err => {
                loading.dismissAll();
            });
        } else {
            this.imagesService.save(this.recipe.imageUrl).then(res => {
                this.recipe.imageUrl = res;
                this.neo4jService.saveRecipe(this.recipe).then(v => {
                    this.showToast("DATA_SAVED");
                    this.editMode = false;
                    this.toggleMode(false);
                    loading.dismissAll();
                    this.events.publish("recipe:saved", this.recipe);
                }).catch(err => {
                    loading.dismissAll();
                });
            }).catch(err => {
                loading.dismissAll();
            });
        }
    }

    private async getTranslation(key: string): Promise<string> {
        let response = await this.translate.get(key).first().toPromise();
        return response;
    }

    public canSave(): boolean {
        return (
            this.recipe.name != null &&
            this.recipe.duration != null &&
            this.recipe.servings != null &&
            this.recipe.ingredients.length > 0
        );
    }

    private static indexOf(objs: any[], id: number) {
        for (let i = 0; i < objs.length; i++) {
            if (objs[i].id == id) {
                return i;
            }
        }
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

    private showToast(message: string) {
        this.translate.get(message).subscribe(value => {
            this.toast.setMessage(value);
            this.toast.present();
        });
    }

    apply(inputRef: string, form: any) {
        if (inputRef == "name") {
            this.recipe.name = form.name;
        } else if (inputRef == "duration") {
            this.recipe.duration = form.duration;
        } else if (inputRef == "servings") {
            this.recipe.servings = form.servings;
        } else if (inputRef == "ingredients") {
            if (this.actionMode == EditModeType.UPDATE) {
                let index: number = RecipeManagementPage.indexOf(this.recipe.ingredients, form.id);
                this.recipe.ingredients[index] = form;
            } else {
                form.id = this.uuidv4();
                this.recipe.ingredients.push(form);
            }
        } else if (inputRef == "instructions") {
            if (this.actionMode == EditModeType.UPDATE) {
                this.recipe.instructions[form.order] = form.description;
            } else {
                this.recipe.instructions.push(form.description);
            }
        } else if (inputRef == "notes") {
            this.recipe.notes = form.notes;
        }
        this.toggleMode(false);
    }

    private uuidv4(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            let r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}

enum EditModeType {
    NEW = 1,
    UPDATE
}
