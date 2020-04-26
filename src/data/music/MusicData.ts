import MusicNotesData from "./MusicNotesData";
import MusicNotesDifficulty from "./MusicNotesDifficulty";
import MusicStatistics from "./MusicStatistics";

export default interface MusicData {
    title?: string;
    artist?: string;
    genre?: string;
    bpm?: number;
    notesData: Map<MusicNotesDifficulty, MusicNotesData>;
}
