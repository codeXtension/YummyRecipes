import { NgModule } from "@angular/core";
import { RecipeComponent } from "./recipe/recipe";
import { IonicModule } from "ionic-angular";
import { HttpModule, Http, JsonpModule } from "@angular/http";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "../app/http-loader";
import { RecipePreviewComponent } from "./recipe-preview/recipe-preview";
import { CameraPopoverComponent } from "./camera-popover/camera-popover";
import { PipesModule } from "../pipes/pipes.module";

@NgModule({
  declarations: [
    RecipeComponent,
    RecipePreviewComponent,
    CameraPopoverComponent
  ],
  imports: [
    PipesModule,
    IonicModule,
    HttpModule,
    JsonpModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [Http]
      }
    })
  ],
  entryComponents: [CameraPopoverComponent],
  exports: [RecipeComponent, RecipePreviewComponent, CameraPopoverComponent]
})
export class ComponentsModule {}

export function createTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
