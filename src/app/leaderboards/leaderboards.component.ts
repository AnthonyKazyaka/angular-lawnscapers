import { Component, OnInit } from '@angular/core';
import { LeaderboardService } from '../services/leaderboard.service';
import { ScoreEntry } from '../models/ScoreEntry';
import { RankedScoreEntry } from '../models/RankedScoreEntry';
import { Puzzle } from '../models/Puzzle';
import { PuzzleService } from '../services/puzzle.service';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-leaderboards',
  templateUrl: './leaderboards.component.html',
  styleUrls: ['./leaderboards.component.css']
})
export class LeaderboardsComponent implements OnInit {
  officialLeaderboards: Map<string, RankedScoreEntry[]> = new Map();
  communityLeaderboards: Map<string, RankedScoreEntry[]> = new Map();
  activeTab: 'official' | 'community' = 'official';
  activeTabIndex = 0;

  constructor(private gameService: GameService, private leaderboardService: LeaderboardService, private puzzleService: PuzzleService) { }

  async ngOnInit(): Promise<void> {
    const scoreEntryMap: Map<string, ScoreEntry[]> = await this.leaderboardService.getAllLeaderboardScores();
    const officialPuzzleData = await this.puzzleService.getOfficialPuzzlesData();
    const communityPuzzleData = await this.puzzleService.getCommunityPuzzlesData();
  
    const officialPuzzles: Map<string, Puzzle> = new Map(officialPuzzleData.map(puzzle => [puzzle.id, new Puzzle(puzzle)]));
    const communityPuzzles: Map<string, Puzzle> = new Map(communityPuzzleData.map(puzzle => [puzzle.id, new Puzzle(puzzle)]));
  
    this.officialLeaderboards = this.leaderboardService.convertToRankedScoreEntryMap(scoreEntryMap, officialPuzzles);
    this.communityLeaderboards = this.leaderboardService.convertToRankedScoreEntryMap(scoreEntryMap, communityPuzzles);

    this.officialLeaderboards = this.leaderboardService.sortLeaderboardsByUser(this.officialLeaderboards, this.gameService.playerName);
    this.communityLeaderboards = this.leaderboardService.sortLeaderboardsByUser(this.communityLeaderboards, this.gameService.playerName);
  }

  changeTab(tab: 'official' | 'community') {
    this.activeTab = tab;
    this.activeTabIndex = tab === 'official' ? 0 : 1;
  }

  openTab(evt: MouseEvent, tabName: string): void {
    const tabcontent = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontent.length; i++) {
      (tabcontent[i] as HTMLElement).style.display = 'none';
    }

    const tablinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tablinks.length; i++) {
      tablinks[i].classList.remove('active');
    }

    document.getElementById(tabName)!.style.display = 'block';
    (evt.target as HTMLElement).classList.add('active');
  }
}