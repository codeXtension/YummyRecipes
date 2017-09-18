import { NgModule } from "@angular/core";
import { IonicModule } from "ionic-angular";
import { HttpModule, Http, JsonpModule } from "@angular/http";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "../app/http-loader";
import { PipesModule } from "../pipes/pipes.module";
import { DirectivesModule } from "../directives/directives.module";
import { HomePage } from "../pages/home/home";
import { SettingsPage } from "../pages/settings/settings";
import { RecipeManagementPage } from "../pages/recipe-management/recipe-management";
import { ComponentsModule } from "../components/components.module";

@NgModule({
  declarations: [HomePage, SettingsPage, RecipeManagementPage],
  imports: [
    PipesModule,
    DirectivesModule,
    IonicModule,
    HttpModule,
    ComponentsModule,
    JsonpModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [Http]
      }
    })
  ],
  entryComponents: [HomePage, SettingsPage, RecipeManagementPage],
  exports: [HomePage, SettingsPage, RecipeManagementPage]
})
export class PagesModule {}

export function createTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
