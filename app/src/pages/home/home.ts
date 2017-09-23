import { Component } from "@angular/core";
import {
  NavController,
  AlertController,
  NavParams,
  LoadingController,
  Loading
} from "ionic-angular";
import { Neo4JService } from "../../services/neo4j.service";
import { RecipeManagementPage } from "../recipe-management/recipe-management";
import { RecipeEntity } from "../../entities/recipe-entity";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "page-home",
  templateUrl: "home.html",
  providers: [Neo4JService]
})
export class HomePage {
  public showSearchbar: boolean;
  public foundRecipes: RecipeEntity[];
  private pageNumber: number = 0;
  public scrollEnabled: boolean;
  private queryParam: any;
  private loadingScreen: Loading;

  constructor(
    public navCtrl: NavController,
    private navParams: NavParams,
    public alertCtrl: AlertController,
    private neo4jService: Neo4JService,
    private translate: TranslateService,
    public loadingController: LoadingController
  ) {
    this.scrollEnabled = true;
    this.showSearchbar = false;
    this.queryParam = this.navParams.get("favourites");
  }

  ionViewDidLoad() {
    this.reload();
  }

  private showLoadingScreen() {
    this.loadingScreen = this.loadingController.create();

    this.translate.get("PLEASE_WAIT").subscribe(value => {
      this.loadingScreen.setContent(value);
      this.loadingScreen.present();
    });
  }

  reload() {
    this.showLoadingScreen();
    this.neo4jService.findRecipes(0, this.queryParam).then(recipes => {
      this.foundRecipes = recipes;
      this.loadingScreen.dismiss();
    });
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.neo4jService.findRecipes(0, this.queryParam).then(recipes => {
        this.foundRecipes = recipes;
        this.scrollEnabled = true;
        refresher.complete();
      });
    }, 100);
  }

  toggleSearchbar(event) {
    this.foundRecipes = null;
    this.showSearchbar = !this.showSearchbar;
    if (!this.showSearchbar) {
      this.queryParam = null;
      this.showLoadingScreen();
      this.neo4jService.findRecipes(0, this.queryParam).then(recipes => {
        this.foundRecipes = recipes;
        this.loadingScreen.dismiss();
      });
    }
  }

  findRecipes(e: any) {
    var val = e.target.value;
    if (val && val.trim() != "" && val.length > 2) {
      this.queryParam = val;
      this.showLoadingScreen();
      this.neo4jService.findRecipes(0, this.queryParam).then(recipes => {
        this.foundRecipes = recipes;
        this.loadingScreen.dismiss();
      });
    }
  }

  newRecipe() {
    let recipe: RecipeEntity;
    recipe = new RecipeEntity(
      this.uuidv4(),
      null,
      null,
      null,
      false,
      [],
      [],
      [],
      "assets/imgs/no_image.jpg",
      null
    );
    this.navCtrl.push(RecipeManagementPage, { entity: recipe, editMode: true });
  }

  poll(event) {
    setTimeout(() => {
      this.neo4jService
        .findRecipes(++this.pageNumber, this.queryParam)
        .then(recipes => {
          if (recipes.length == 0) {
            this.scrollEnabled = false;
          } else {
            this.foundRecipes = recipes;
          }
          event.complete();
        });
    }, 100);
  }

  private uuidv4(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
