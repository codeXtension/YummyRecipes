import {Component} from "@angular/core";
import {NavController, Platform, ToastController} from "ionic-angular";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Neo4JService} from "../../services/neo4j.service";
import {AuthInfo} from "../../services/auth-info";
import {SecureStorage, SecureStorageObject} from "@ionic-native/secure-storage";
import {Storage} from "@ionic/storage";

@Component({
    selector: "page-settings",
    templateUrl: "settings.html",
    providers: [Neo4JService]
})
export class SettingsPage {
    public settingsForm: FormGroup;

    constructor(public navCtrl: NavController,
                private formBuilder: FormBuilder,
                public toastCtrl: ToastController,
                private secureStorage: SecureStorage,
                private neo4jService: Neo4JService,
                private storage: Storage,
                private platform: Platform) {
        this.settingsForm = this.formBuilder.group({
            serverUrl: ["", Validators.required],
            username: [""],
            password: [""]
        });

        if (this.platform.is("core") || this.platform.is("mobileweb")) {
            this.storage
                .get("settings")
                .then((val: AuthInfo) => {
                    this.settingsForm = this.formBuilder.group({
                        serverUrl: [val.serverUrl, Validators.required],
                        username: [val.username],
                        password: [val.password]
                    });
                })
                .catch(err => {
                    console.error("Cannot load the secure storage engine");
                });
        } else {
            this.secureStorage
                .create("laziz")
                .then((storage: SecureStorageObject) => {
                    storage.get("settings").then(data => {
                        if (data != null) {
                            let val = JSON.parse(data);
                            this.settingsForm = this.formBuilder.group({
                                serverUrl: [val.serverUrl, Validators.required],
                                username: [val.username],
                                password: [val.password]
                            });
                        }
                    });
                })
                .catch(err => {
                    console.error("Cannot load the secure storage engine");
                });
        }
    }

    showToast(msg: string) {
        let toast = this.toastCtrl.create({
            message: msg,
            duration: 3000,
            position: "top"
        });

        toast.present(toast);
    }

    ionViewDidLoad() {
    }

    saveSettings() {
        this.neo4jService
            .count(this.settingsForm.value)
            .then(() => {
                if (this.platform.is("core") || this.platform.is("mobileweb")) {
                    if (this.settingsForm.value.serverUrl.endsWith("/")) {
                        this.settingsForm.value.serverUrl = this.settingsForm.value.serverUrl.substr(0, this.settingsForm.value.serverUrl.lastIndexOf("/"));
                    }
                    this.storage
                        .set("settings", this.settingsForm.value)
                        .then(v => {
                            // this.translate.get("SETTINGS_SAVED_SUCCESS").subscribe(value => {
                            //     this.showToast(value);
                            //     return this.navCtrl.goToRoot(null);
                            // });
                        })
                        .catch(err => {
                            // this.translate.get("SETTINGS_SAVED_FAILED").subscribe(value => {
                            //     this.showToast(value);
                            // });
                        });
                } else {
                    this.secureStorage
                        .create("laziz")
                        .then((storage: SecureStorageObject) => {
                            storage
                                .set("settings", JSON.stringify(this.settingsForm.value))
                                .then(
                                    data => {
                                        // this.translate
                                        // .get("SETTINGS_SAVED_SUCCESS")
                                        // .subscribe(value => {
                                        //     this.showToast(value);
                                        //     return this.navCtrl.goToRoot(null);
                                        // });
                                    },
                                    error => {
                                        // this.translate
                                        //     .get("SETTINGS_SAVED_FAILED")
                                        //     .subscribe(value => {
                                        //         this.showToast(value);
                                        //     });
                                    }
                                );
                        })
                        .catch(err => {
                            // this.translate.get("SETTINGS_SAVED_FAILED").subscribe(value => {
                            //     this.showToast(value);
                            // });
                        });
                }
            })
            .catch(err => {
                // this.translate.get("SETTINGS_SAVED_FAILED").subscribe(value => {
                //     this.showToast(value);
                // });
            });
    }
}
