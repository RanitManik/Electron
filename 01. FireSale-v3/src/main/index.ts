import { app, BrowserWindow, dialog } from "electron";
import { join } from "path";
import { readFile } from "node:fs/promises";

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            preload: join(__dirname, "preload.js")
        }
    });

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(
            join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
        );
    }

    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
        mainWindow.focus();
        showOpenDialog(mainWindow);
    });
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

const showOpenDialog = async (browserWindow: BrowserWindow) => {
    const result = await dialog.showOpenDialog(browserWindow, {
        properties: ["openFile"],
        filters: [{ name: "Markdown File", extensions: ["md"] }]
    });

    if (result.canceled) return;

    const [filePath] = result.filePaths;

    openFile(browserWindow, filePath);
};

const openFile = async (browserWindow: BrowserWindow, filePath: string) => {
    const content = await readFile(filePath, { encoding: "utf8" });

    browserWindow.webContents.send("file-opened", content, filePath);
};
