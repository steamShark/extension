import { BadgeAlert, History, PictureInPicture, Save, SettingsIcon } from "lucide-react";
import "../styles/Settings.css"
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input"
import { SettingsData } from "@/common/interfaces";
import { defaultSettings, defaultSettingsStore } from "@/common/defaults";
import { ResetSettingsConfirm } from "../components/ResetSettingsConfirm";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner"
import { SettingsErrorState } from "../components/SettingsErrorLoadingPage";
/* import { useChromeStorage } from "../hooks/useChromeStorage";
import { SettingsData } from "../../common/interfaces"; */

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

export default function Settings() {
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    async function loadSettings() {
        setLoading(true);
        try {
            chrome.storage.local.get(["settings"]).then((res) => {
                if (res && res.settings) {
                    try {
                        const data: SettingsData = JSON.parse(res.settings).data;
                        setSettings(data);
                    } catch (e) {
                        console.error("Failed to parse settings:", e);
                    }
                }
            });
        } catch (e) {
            console.error("Failed to load settings", e);
            setSettings(null);
        } finally {
            setLoading(false);
        }
    }

    /* Get Settings from localstorage */
    useEffect(() => {
        loadSettings()
    }, []);

    /* Funtion to handle with input changes, only in useState object, not in extension local storage settings */
    const handleInputChange = <K extends keyof SettingsData>(
        key: K,
        value: SettingsData[K]
    ) => {
        setSettings(prev => (prev ? { ...prev, [key]: value } : prev));
    };

    /* Function to handling with saving the settings */
    const handleSave = () => {
        try {
            chrome.storage.local.set({
                settings: JSON.stringify({ data: settings }),
            });
            //Inject popup/toaster of success
            toast.success("Settings were saved!")
        } catch (err) {
            //Inject popup/toaster of error 
            toast.error("An error occured while saving settings.", {
                description: 'You can see the error in console',
            })
            console.log("🦈steamShark error: " + err)
        }

        console.log("Settings saved:", settings);
    };

    /* Reset settings to default */
    const handleReset = () => {
        try {
            chrome.storage.local.set({
                settings: JSON.stringify(defaultSettingsStore),
            });
            //Inject popup/toaster of success
            alert("settings saved")
            /* Other actions after storage was saved successfully */
            setSettings(defaultSettings);
            location.reload();
            return;
        } catch (err) {
            //Inject popup/toaster of error 
            alert("error")
        }
    };

    /* If the settings were not obtained from the extension local storage */
    if (!settings) {
        return (
            <SettingsErrorState
                onRetry={loadSettings}
                onUseDefaults={() => setSettings(defaultSettings)}
                showLoading={loading}
            />
        );
    }

    return (
        <section className="container flex flex-col gap-5">
            {/* HEADER */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center text-3xl font-bold gap-2">
                    <SettingsIcon className="icon-primary w-5 h-5" />
                    <h2>Settings</h2>
                </div>
                <p className="text-muted-foreground">
                    Configure your steamShark extension preferences
                </p>
            </div>
            {/* POPUP SETTINGS */}
            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <PictureInPicture className="icon-primary w-5 h-5" />
                    <h2 className="text-primary font-semibold text-xl">Popup Settings:</h2>
                </CardHeader>

                <CardContent className="flex flex-col items-start gap-5">
                    <div className="settings-group-row">
                        <label className="text-foreground">Always show popup when is a trusted website</label>
                        <Select onValueChange={(e) => handleInputChange("showPopUpInRepeatedTrustedWebsite", e === "true" ? true : false)}>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder={settings.showPopUpInRepeatedTrustedWebsite ? "yes" : "no"} />
                            </SelectTrigger>
                            <SelectContent className="bg-background">
                                <SelectItem value="true">yes</SelectItem>
                                <SelectItem value="false">no</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>


                    <div className="settings-group-row">
                        <label>Popup position</label>
                        <Select onValueChange={(val) =>
                            handleInputChange("popupPosition", val as SettingsData["popupPosition"])
                        }>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder={settings.popupPosition} />
                            </SelectTrigger>
                            <SelectContent className="bg-background">
                                <SelectItem value="tr">Right (top)</SelectItem>
                                <SelectItem value="tp">Left (top)</SelectItem>
                                <SelectItem value="tb">Right (bottom)</SelectItem>
                                <SelectItem value="lb">Left (bottom)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>


                    <div className="settings-group-col">
                        <label>How much time to show popup</label>
                        <div className="time-input">
                            <Input type="number"
                                min={1}
                                max={50000}
                                step={1}
                                value={settings.popupDurationMs / 1000}
                                onChange={(e) => {
                                    // handle empty string while user clears the field
                                    const raw = e.target.value;
                                    if (raw === "") {
                                        // optional: keep it blank in UI without committing; or set a temp local state
                                        return;
                                    }

                                    const secs = Number(raw);
                                    if (Number.isNaN(secs)) return;

                                    // clamp to your UI range (1..50000 seconds)
                                    const clampedSecs = clamp(Math.round(secs), 1, 50000);

                                    // convert to ms for storage
                                    const ms = clampedSecs * 1000;

                                    handleInputChange("popupDurationMs", ms);
                                }} />
                            <span>seconds!</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SCAM ALERT SETTINGS */}
            <Card className="">
                <CardHeader className="flex flex-row items-center gap-2">
                    <BadgeAlert className="icon-primary w-5 h-5" />
                    <h2 className="text-primary font-semibold text-xl">Scam Alert Settings:</h2>
                </CardHeader>

                <CardContent className="flex flex-col items-start gap-5">
                    <div className="settings-group-row flex items-center gap-4">
                        <p
                            className={`cursor-pointer px-2 py-1 rounded-md text-sm transition-colors ${!settings.redirectToWarningPage
                                ? "bg-primary text-primary-foreground font-medium"
                                : "text-muted-foreground"
                                }`}
                            onClick={() => handleInputChange("redirectToWarningPage", false)}
                        >
                            Only show warning popup
                        </p>

                        <Switch
                            checked={settings.redirectToWarningPage}
                            onCheckedChange={(checked) => handleInputChange("redirectToWarningPage", checked)}
                        />

                        <p
                            className={`cursor-pointer px-2 py-1 rounded-md text-sm transition-colors ${settings.redirectToWarningPage
                                ? "bg-primary text-primary-foreground font-medium"
                                : "text-muted-foreground"
                                }`}
                            onClick={() => handleInputChange("redirectToWarningPage", true)}
                        >
                            Redirect to warning page
                        </p>
                    </div>
                    <div className="settings-group-col">
                        <label>How much time to ingnore scam website</label>
                        <div className="time-input">
                            <Input type="number"
                                min={1}
                                step={1}
                                value={settings.ignoreScamSiteDurationMs / 60000}
                                onChange={(e) => {
                                    // handle empty string while user clears the field
                                    const raw = e.target.value;
                                    if (raw === "") {
                                        // optional: keep it blank in UI without committing; or set a temp local state
                                        return;
                                    }

                                    const secs = Number(raw);
                                    if (Number.isNaN(secs)) return;

                                    // clamp to your UI range (1..50000 seconds)
                                    const clampedSecs = clamp(Math.round(secs), 1, 50000);

                                    // convert to ms for storage
                                    const ms = clampedSecs * 60000;

                                    handleInputChange("ignoreScamSiteDurationMs", ms);
                                }} />
                            <span>minutes!</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* HISTORY SETTINGS */}
            <Card className="">
                <CardHeader className="flex flex-row items-center gap-2">
                    <History className="icon-primary w-5 h-5" />
                    <h2 className="text-primary font-semibold text-xl">History Settings:</h2>
                </CardHeader>

                <CardContent className="flex flex-col items-start gap-5">
                    <div className="settings-group-col">
                        <label className="text-md">How much time to register in history</label>
                        <div className="time-input">
                            <Input type="number"
                                min={1}
                                max={50000}
                                step={1}
                                value={settings.historyRepeatEntryCooldownMs / 1000}
                                onChange={(e) => {
                                    // handle empty string while user clears the field
                                    const raw = e.target.value;
                                    if (raw === "") {
                                        // optional: keep it blank in UI without committing; or set a temp local state
                                        return;
                                    }

                                    const secs = Number(raw);
                                    if (Number.isNaN(secs)) return;

                                    // clamp to your UI range (1..50000 seconds)
                                    const clampedSecs = clamp(Math.round(secs), 1, 50000);

                                    // convert to ms for storage
                                    const ms = clampedSecs * 1000;

                                    handleInputChange("historyRepeatEntryCooldownMs", ms);
                                }} />
                            <span>seconds!</span>
                        </div>
                    </div>

                    <div className="settings-group-col">
                        <label>History Length</label>
                        <p className="text-muted-foreground">max: 100</p>
                        <div className="time-input">
                            <Input type="number"
                                min={1}
                                max={100}
                                step={1}
                                value={settings.maxHistoryEntries}
                                onChange={(e) => handleInputChange("maxHistoryEntries", Number(e.target.value))} />
                            <span>items!</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-row items-center justify-between">
                <ResetSettingsConfirm onConfirm={handleReset} />

                <Button
                    variant="default"
                    onClick={handleSave}
                    className="flex items-center space-x-2 cursor-pointer"
                >
                    <Save size={18} />
                    <span>SAVE</span>
                </Button>
            </div>
        </section>
    );
}
