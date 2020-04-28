import Ma2Importer from "../../src/importer/Ma2Importer";
import Ma2MusicData from "../../src/data/music/format/Ma2MusicData";
import MusicNotesDifficulty from "../../src/data/music/MusicNotesDifficulty";
import SimaiImporter from "../../src/importer/SimaiImporter";
import NoteType from "../../src/data/music/object/NoteType";
import SlideNote from "../../src/data/music/object/SlideNote";
import HoldNote from "../../src/data/music/object/HoldNote";

describe('ma2 importer', () => {
    it('should import correctly', async () => {
        const importer = new Ma2Importer;
        const ma2MusicData: Ma2MusicData = <Ma2MusicData>await importer.import('tests/resources/Music.xml');
        const simaiImporter = new SimaiImporter;
        const simaiMusicData = await simaiImporter.import('tests/resources/maidata.txt');

        expect(ma2MusicData.title).toBe(simaiMusicData.title);
        expect(ma2MusicData.artist).toBe(simaiMusicData.artist);
        expect(ma2MusicData.bpm).toBe(simaiMusicData.bpm);
        expect(ma2MusicData.notesData.size).toBe(simaiMusicData.notesData.size);
        expect(ma2MusicData.notesData.get(MusicNotesDifficulty.BASIC)?.level).toBe(simaiMusicData.notesData.get(MusicNotesDifficulty.BASIC)?.level);
        expect(ma2MusicData.notesData.get(MusicNotesDifficulty.ADVANCED)?.level).toBe(simaiMusicData.notesData.get(MusicNotesDifficulty.ADVANCED)?.level);
        expect(ma2MusicData.notesData.get(MusicNotesDifficulty.EXPERT)?.level).toBe(simaiMusicData.notesData.get(MusicNotesDifficulty.EXPERT)?.level);
        expect(ma2MusicData.notesData.get(MusicNotesDifficulty.MASTER)?.level).toBe(simaiMusicData.notesData.get(MusicNotesDifficulty.MASTER)?.level);
        expect(ma2MusicData.notesData.get(MusicNotesDifficulty.RE_MASTER)?.level).toBe(simaiMusicData.notesData.get(MusicNotesDifficulty.RE_MASTER)?.level);

        for (const difficulty of Array.from(ma2MusicData.notesData.keys())) {
            const ma2NotesData = ma2MusicData.notesData.get(difficulty);
            const simaiNotesData = simaiMusicData.notesData.get(difficulty);

            if (ma2NotesData && simaiNotesData) {
                let i = 0;
                for (const ma2Note of ma2NotesData.noteObjects) {
                    const simaiNote = simaiNotesData.noteObjects[i++];
                    expect(ma2Note.measure).toBe(simaiNote.measure);
                    expect(ma2Note.grid).toBe(simaiNote.grid);
                    expect(ma2Note.area).toBe(simaiNote.area);
                    expect(ma2Note.position).toBe(simaiNote.position);
                    expect(ma2Note.type).toBe(simaiNote.type);

                    if (ma2Note.type === NoteType.SLIDE) {
                        const ma2Slide = <SlideNote>ma2Note;
                        const simaiSlide = <SlideNote>simaiNote;
                        expect(ma2Slide.waitDuration).toBe(simaiSlide.waitDuration);
                        expect(ma2Slide.travelDuration).toBe(simaiSlide.travelDuration);
                        expect(ma2Slide.endPosition).toBe(simaiSlide.endPosition);
                        expect(ma2Slide.slideType).toBe(simaiSlide.slideType);
                    } else if (ma2Note.type === NoteType.HOLD) {
                        expect((<HoldNote>ma2Note).holdLength).toBe((<HoldNote>simaiNote).holdLength);
                    } else if (ma2Note.area === 'C' && (ma2Note.type === NoteType.TOUCH_TAP || ma2Note.type === NoteType.TOUCH_HOLD)) {
                        expect(ma2Note.firework).toBe(simaiNote.firework);
                    }
                }
            }
        }
    });
});
