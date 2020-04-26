import commandLineArgs from "command-line-args";
import SourceFormat from "./data/cli/SourceFormat";
import TargetFormat from "./data/cli/TargetFormat";
import MymaiCommandLineOptions from "./data/cli/MymaiCommandLineOptions";
import Importer from "./importer/Importer";
import Exporter from "./exporter/Exporter";
import SimaiImporter from "./importer/SimaiImporter";
import Ma2Importer from "./importer/Ma2Importer";
import SimaiExporter from "./exporter/SimaiExporter";
import Ma2Exporter from "./exporter/Ma2Exporter";

export default class Mymai {
    public static NAME = 'mymai';
    public static VERSION = '1.0.0';
    private isInitialized: boolean = false;
    private _importers: Map<SourceFormat, Importer> = new Map<SourceFormat, Importer>();
    private _exporters: Map<TargetFormat, Exporter> = new Map<TargetFormat, Exporter>();

    get importers() {
        return this._importers;
    }

    get exporters() {
        return this._exporters;
    }

    async handle(args: string[]) {
        const options: MymaiCommandLineOptions = commandLineArgs(this.getOptionDefinitions());
        if (args.length === 0 || options.help || !options.files || options.files.length == 0) {
            this.showHelp();
        } else {
            if (!this.isInitialized) {
                this.initImporters();
                this.initExporters();
                this.isInitialized = true;
            }

            const sourceFormat = options.sourceFormat ? SourceFormat[options.sourceFormat] : SourceFormat.SIMAI;
            const targetFormat = options.targetFormat ? TargetFormat[options.targetFormat] : TargetFormat.MA2;
            const outDir = options.outDir ? options.outDir : 'output';
            for (const path of options.files) {
                console.log(`Importing source: [${sourceFormat}] ${path}...`);
                const importer = this._importers.get(sourceFormat);
                const exporter = this._exporters.get(targetFormat);
                if (importer && exporter) {
                    const musicData = await importer.import(path);
                    if (musicData) {
                        console.log(`Exporting to target: [${targetFormat}] ${path}...`);
                        const exportedFiles = await exporter.export(musicData, outDir);
                        if (exportedFiles && exportedFiles.length > 0) {
                            console.log(`Export successful. These files were created in outDir: ${exportedFiles.join(', ')}`);
                        } else {
                            console.log(`Export failed. No files were created.`);
                        }
                    }
                } else {
                    if (!importer) {
                        console.log(`No suitable importer was found for '${path}' (${sourceFormat})`);
                    } else {
                        console.log(`No suitable exporter was found for '${path}' (${targetFormat})`);
                    }
                }
            }
        }
    }

    private initImporters() {
        this._importers.set(SourceFormat.SIMAI, new SimaiImporter);
        this._importers.set(SourceFormat.MA2, new Ma2Importer);
    }

    private initExporters() {
        this._exporters.set(TargetFormat.SIMAI, new SimaiExporter);
        this._exporters.set(TargetFormat.MA2, new Ma2Exporter);
    }

    private getOptionDefinitions() {
        return [
            { name: 'help', alias: 'h', type: Boolean },
            { name: 'outDir', alias: 'o', type: String },
            { name: 'sourceFormat', alias: 's', type: String },
            { name: 'targetFormat', alias: 't', type: String },
            { name: 'files', type: String, multiple: true, defaultOption: true }
        ];
    }

    private showHelp() {
        console.log(`Version ${Mymai.VERSION}`);
        console.log(`Usage:    ${Mymai.NAME} [options] [file...]\n`);

        console.log(`Examples: ${Mymai.NAME} tutorial/maidata.txt`);
        console.log(`          ${Mymai.NAME} --outDir ~/converted 0019_acceleration/maidata.txt 0021_fragrance/maidata.txt\n`);

        console.log(`Options:`);
        console.log(` -h, --help             Print this message.`);
        console.log(` -o, --outDir           Specify the output directory. Defaults to 'output'`);
        console.log(` -s, --sourceFormat     Specify the source data format: 'simai' (default), 'ma2'`);
        console.log(` -t, --targetFormat     Specify the target data format: 'ma2' (default), 'simai'`);
    }
}
