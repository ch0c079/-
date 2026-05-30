import random
import os
import time

# ==============================================================================
# [게임 설정]
# ==============================================================================
DISCUSSION_TIME_MINUTES = 5  

PAUSE_MAFIA = 3
PAUSE_POLICE = 3
PAUSE_MEDIUM = 3
PAUSE_FOOL = 4
PAUSE_TROUBLEMAKER = 3
PAUSE_CITIZEN = 4
# ==============================================================================

# --- ANSI 가변 색상 상수 정의 ---
C_RESET = "\033[0m"
C_MAFIA = "\033[91m"    
C_CITIZEN = "\033[92m"  
C_NEUTRAL = "\033[94m"  

TEAM_MAFIA = {'마피아'}
TEAM_CITIZEN = {'경찰', '영매', '탐정', '말썽쟁이', '바보', '시민', '한밤중의 마피아'}
TEAM_NEUTRAL = {'광인', '스토커', '주술사'}

def get_colored_role(role):
    if role in TEAM_MAFIA:
        return f"{C_MAFIA}{role}{C_RESET}"
    elif role in TEAM_CITIZEN:
        return f"{C_CITIZEN}{role}{C_RESET}"
    elif role in TEAM_NEUTRAL:
        return f"{C_NEUTRAL}{role}{C_RESET}"
    return role

def get_colored_team(team_name):
    if "마피아" in team_name: return f"{C_MAFIA}{team_name}{C_RESET}"
    elif "시민" in team_name: return f"{C_CITIZEN}{team_name}{C_RESET}"
    return f"{C_NEUTRAL}{team_name}{C_RESET}"

class ResetGameException(Exception): pass

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')
    print('\n' * 50 + '\033[2J\033[H', end='')

def custom_input(prompt):
    user_input = input(prompt).strip()
    if user_input.lower() == 'end':
        raise ResetGameException()
    return user_input

def get_valid_input(prompt, valid_options):
    while True:
        user_input = custom_input(prompt)
        if user_input in valid_options:
            return user_input
        print(f"[오류] 잘못된 입력입니다. 선택지({', '.join(valid_options)}) 중에서 입력해주세요.")

def show_game_rules():
    clear_screen()
    print("==================================================================")
    print(f"             [ {get_colored_role('한밤중의 마피아')} ] 초보자 완벽 가이드             ")
    print("==================================================================")
    print(" 환영합니다! 이 게임은 일반적인 마피아 게임과 달리, [단 하루의 밤과 낮]으로만")
    print(" 끝나는 초스피드 심리전 게임입니다. 탈락자 없이 모두가 끝까지 즐길 수 있습니다.")
    print(" (※ 게임 진행 중 언제든지 'end'를 입력하면 처음 화면으로 돌아갑니다.)\n")
    
    print("------------------------------------------------------------------")
    print(" < 게임의 핵심 포인트 3가지! >")
    print("------------------------------------------------------------------")
    print(" 1. 내 직업은 언제든 바뀔 수 있습니다!")
    print("    - 밤사이 '말썽쟁이'의 능력에 의해 나도 모르는 새 카드가 남과 바뀔 수")
    print("      있습니다! 승패는 투표 직전 [최종적으로 내가 들고 있는 카드] 기준입니다.\n")
    print(" 2. 남는 카드는 '바닥'에 깔립니다!")
    print("    - 4명이서 7장(바닥에 3장)으로 플레이할 경우, 이번 판에 실제 마피아나")
    print("      경찰이 아예 없을 수도 있습니다. 이를 이용해 마음껏 거짓말을 하세요!\n")
    print(" 3. 단 한 번의 처형으로 승패가 끝납니다!")
    print("    - 며칠씩 지나지 않고, 딱 한 번의 낮 투표로 1명을 처형하고 게임이 종료됩니다.\n")
    
    custom_input(" >> 다음 페이지로 넘어가려면 [Enter]를 누르세요...")
    clear_screen()
    
    print("==================================================================")
    print(" < 게임 진행 순서 >")
    print("==================================================================")
    print(" [1단계] 배분 : 인원수보다 많은 카드를 섞고 1장씩 받습니다. 남는 카드는 '바닥'에 둡니다.")
    print(" [2단계] 밤   : 모두 눈을 감고 1명씩 화면을 보며 직업 고유 능력을 몰래 씁니다.")
    print("                (능력이 없는 직업도 들키지 않게 키보드를 치는 척 연기해야 합니다.)")
    print(" [3단계] 낮   : 제한 시간 동안 자유롭게 토론하며 거짓말과 추리를 섞어냅니다.")
    print(" [4단계] 투표 : 동시에 1명을 지목해 처형합니다. 마피아가 없다고 판단되면")
    print("                '아무도 죽이지 않음(none)'을 선택할 수 있습니다.\n")
    
    print("==================================================================")
    print(" < 직업 및 진영 소개 >")
    print("==================================================================")
    
    print(f" [ {get_colored_team('마피아 팀')} ]")
    print(" * 목표: 시민 팀에게 들켜 처형당하지 않고 살아남으면 승리!")
    print(f"   - {get_colored_role('마피아')}   : 밤에 [바닥에 깔린 카드 중 1장]을 몰래 확인합니다.\n")
    
    print(f" [ {get_colored_team('시민 팀')} ]")
    print(" * 목표: 숨어있는 마피아를 찾아내 처형하면 승리!")
    print("         (단, 마피아가 바닥에만 있을 때 시민을 죽이면 시민 팀 패배!)")
    print(f"   - {get_colored_role('경찰')}     : 플레이어 1명을 조사합니다. [진짜 직업]과 [가짜 직업] 2개가 섞여 보입니다.")
    print(f"   - {get_colored_role('영매')}     : 바닥 카드 1장을 봅니다. [진짜 직업]과 [가짜 직업] 2개가 섞여 보입니다.")
    print(f"   - {get_colored_role('탐정')}     : 특정 직업 카드가 [누군가의 손]에 있는지 [바닥]에 있는지 위치만 추적합니다.")
    # 🔥 말썽쟁이 설명 변경
    print(f"   - {get_colored_role('말썽쟁이')} : 플레이어 1명을 지목하여 그 카드를 다른 누군가 또는 바닥 카드와 무작위로 맞바꿉니다.")
    print(f"   - {get_colored_role('바보')}     : 자신이 바보인지 모릅니다! 화면의 완벽한 가짜 정보에 속아 혼란을 줍니다.")
    print(f"   - {get_colored_role('시민')}     : 밤 동안 아무 능력이 없어 추리 메모(블러핑 연기)만 작성합니다.\n")
    
    print(f" [ {get_colored_team('중립 팀')} ]")
    print(" * 목표: 시민도 마피아도 아닙니다. 오직 나만의 개인 임무를 달성하면 승리!")
    print(f"   - {get_colored_role('광인')}     : 낮 투표에서 사람들의 의심을 사서 [자신이 처형당하면] 단독 승리합니다!")
    print(f"   - {get_colored_role('스토커')}   : 밤에 타깃 1명을 정해, 낮 투표에서 [그 타깃이 죽으면] 공동 승리합니다!")
    print(f"   - {get_colored_role('주술사')}   : 투표 직전 정체를 밝히고, [모두의 최종 직업]을 맞히면 단독 승리합니다!")
    print("==================================================================")
    custom_input(" >> 가이드를 모두 숙지하셨다면 [Enter]를 눌러 메인 메뉴로 돌아갑니다.")

def game_moderator():
    while True:
        try:
            clear_screen()
            print("==================================================")
            print(f"         공동 전선전 [{get_colored_role('한밤중의 마피아')}] v6.6         ")
            print("==================================================")
            print(" 1. 게임 규칙 및 진영/직업 설명 보기")
            print(" 2. 바로 게임 시작하기")
            print("==================================================")
            print("(※ 게임 중 언제든지 'end'를 입력하면 메인 메뉴로 리셋됩니다.)\n")
            menu_choice = get_valid_input("> 원하는 메뉴의 번호를 입력하세요: ", ['1', '2'])
            
            if menu_choice == '1':
                show_game_rules()
                continue
            
            clear_screen()
            num_players = int(get_valid_input("> 플레이할 인원수를 선택하세요 (3, 4, 5 중 입력): ", ['3', '4', '5']))
            num_center_cards = int(get_valid_input("> 바닥에 깔아둘 카드 수를 선택하세요 (1~5 중 입력): ", ['1', '2', '3', '4', '5']))
            
            total_cards_needed = num_players + num_center_cards
            valid_centers = [str(x) for x in range(1, num_center_cards + 1)]
            
            players = []
            for i in range(num_players):
                while True:
                    name = custom_input(f"> 플레이어 {i+1}의 이름을 입력하세요: ")
                    if name and name not in players and not name.startswith('바닥'):
                        players.append(name)
                        break
                    print("[경고] 올바르지 않거나 중복된 이름입니다.")
                
            roles = ['마피아']
            pool = {'1': '경찰', '2': '영매', '3': '탐정', '4': '바보', '5': '말썽쟁이', '6': '광인', '7': '스토커', '8': '주술사', '9': '시민'}
            warning_msg = ""  
            
            while len(roles) < total_cards_needed:
                clear_screen()
                print("==================================================")
                print("                 카드 커스텀 빌더                 ")
                print("==================================================")
                print(f"총 선택해야 할 카드 수: [ {total_cards_needed}장 ]")
                print(f"[안내] [{get_colored_role('마피아')}] 1장은 기본으로 포함됩니다.")
                print(f"\n--------------------------------------------------")
                print(f"현재 구성된 덱 ({len(roles)}/{total_cards_needed}): {', '.join([get_colored_role(r) for r in roles])}")
                
                if warning_msg:
                    print(f"\n{warning_msg}")
                    warning_msg = ""
                else:
                    print()
                
                for k, v in pool.items():
                    if v != '시민' and v in roles:
                        print(f" {k}. {get_colored_role(v)} (이미 선택됨)")
                    else:
                        print(f" {k}. {get_colored_role(v)}")
                        
                choice = custom_input(f"\n> 번호 입력 (남은 선택: {total_cards_needed - len(roles)}장): ")
                
                if choice in pool:
                    selected_role = pool[choice]
                    if selected_role != '시민' and selected_role in roles:
                        warning_msg = f"[경고] {get_colored_role(selected_role)}은(는) 중복 선택할 수 없습니다."
                    else:
                        roles.append(selected_role)
                        warning_msg = f"[선택완료] {get_colored_role(selected_role)} 카드가 추가되었습니다."
                else:
                    warning_msg = "[경고] 올바른 번호를 입력해주세요."
                    
            random.shuffle(roles)
            
            game_cards = {players[i]: roles[i] for i in range(num_players)}
            for j in range(num_center_cards):
                game_cards[f'바닥{j+1}'] = roles[num_players + j]
            
            initial_cards = game_cards.copy()

            citizen_pool_in_game = [r for r in roles if r in {'경찰', '영매', '탐정', '말썽쟁이', '시민'}]
            if not citizen_pool_in_game: citizen_pool_in_game = ['시민']
                
            fool_disguises = {p: random.choice(citizen_pool_in_game) for p in players if game_cards[p] == '바보'}

            stalker_target = None
            troublemaker_choice = None

            # [ 밤의 행동 단계 ]
            for player in players:
                clear_screen()
                print("==================================================")
                print(f" [안내] 다음 차례: [{player}] 님")
                print("==================================================")
                custom_input("다른 사람들은 눈을 감고, 본인만 준비되었다면 [Enter]를 누르세요...")
                
                my_role = initial_cards[player]
                display_role = fool_disguises.get(player, my_role)
                print(f"\n당신의 역할은 [ {get_colored_role(display_role)} ] 입니다.")
                
                other_players = [p for p in players if p != player]

                if display_role == '마피아':
                    choice = get_valid_input(f"\n[{get_colored_role('마피아')}] 확인할 바닥 카드 번호 (1~{num_center_cards}): ", valid_centers)
                    target_role = initial_cards[f'바닥{choice}']
                    if target_role == '바보': target_role = random.choice(citizen_pool_in_game)
                    print(f"-> [정보] 바닥{choice} 카드는 [ {get_colored_role(target_role)} ] 입니다.")
                    time.sleep(PAUSE_MAFIA)
                    
                elif display_role == '경찰':
                    print(f"\n조사 가능 플레이어: {', '.join(other_players)}")
                    target = get_valid_input("정체를 조사할 플레이어 이름: ", other_players)
                    
                    if my_role == '바보':
                        real_job = initial_cards.get(target, '시민')
                    else:
                        real_job = initial_cards[target]
                        if real_job in ['바보', '경찰']:
                            valid_pool = [r for r in {'영매', '탐정', '말썽쟁이', '시민'} if r in roles]
                            real_job = random.choice(valid_pool) if valid_pool else '시민'
                    
                    wrong_pool = [r for r in set(roles) if r not in {real_job, '바보', '경찰'}]
                    if len(wrong_pool) < 1: wrong_pool = [r for r in ['시민', '영매', '탐정', '마피아'] if r != real_job]
                    fake_job = random.choice(wrong_pool)
                    
                    hints = [real_job, fake_job]
                    random.shuffle(hints)
                    print(f"-> [정보] {target}님은 [ {get_colored_role(hints[0])} ] 또는 [ {get_colored_role(hints[1])} ] 입니다.")
                    time.sleep(PAUSE_POLICE if my_role == '경찰' else PAUSE_FOOL)
                    
                elif display_role == '영매':
                    choice = get_valid_input(f"\n[영매] 확인할 바닥 카드 번호 (1~{num_center_cards}): ", valid_centers)
                    target_center = f'바닥{choice}'
                    
                    if my_role == '바보':
                        real_center_job = initial_cards[target_center]
                    else:
                        real_center_job = initial_cards[target_center]
                        if real_center_job in ['바보', '영매']:
                            valid_pool = [r for r in {'경찰', '탐정', '말썽쟁이', '시민'} if r in roles]
                            real_center_job = random.choice(valid_pool) if valid_pool else '시민'
                            
                    wrong_pool = [r for r in set(roles) if r not in {real_center_job, '바보', '영매'}]
                    if len(wrong_pool) < 1: wrong_pool = [r for r in ['경찰', '탐정', '시민', '마피아'] if r != real_center_job]
                    fake_job = random.choice(wrong_pool)
                    
                    hints = [real_center_job, fake_job]
                    random.shuffle(hints)
                    print(f"-> [정보] {target_center} 카드는 [ {get_colored_role(hints[0])} ] 또는 [ {get_colored_role(hints[1])} ] 입니다.")
                    time.sleep(PAUSE_MEDIUM if my_role == '영매' else PAUSE_FOOL)
                    
                elif display_role == '탐정':
                    detective_choices = sorted(list(set(roles) - {'마피아', '탐정', '바보'}))
                    print(f"\n[{get_colored_role('탐정')} 능력 가동]")
                    
                    if my_role == '바보' and not detective_choices:
                        detective_choices = ['시민', '경찰', '영매', '말썽쟁이', '광인', '스토커', '주술사']

                    if not detective_choices:
                        print("조사할 수 있는 연계 직업이 이번 판에 존재하지 않습니다.")
                    else:
                        det_menu = {str(idx + 1): r for idx, r in enumerate(detective_choices)}
                        for k, v in det_menu.items():
                            print(f"  {k}번. {get_colored_role(v)}")
                        det_pick = get_valid_input("> 번호 입력: ", det_menu.keys())
                        chosen_role = det_menu[det_pick]
                        
                        if my_role == '바보':
                            fake_res = random.choice(['바닥', '플레이어 중 한 명'])
                            print(f"-> [정보] [ {get_colored_role(chosen_role)} ] 카드는 현재 [ {fake_res} ] 에 있습니다.")
                        else:
                            on_floor = any(k.startswith('바닥') and v == chosen_role for k, v in initial_cards.items())
                            loc_str = '바닥' if on_floor else '플레이어 중 한 명'
                            print(f"-> [정보] [ {get_colored_role(chosen_role)} ] 카드는 현재 [ {loc_str} ] 에 있습니다.")
                    time.sleep(PAUSE_POLICE if my_role == '탐정' else PAUSE_FOOL)
                    
                # 🔥 말썽쟁이 로직 1인 지목(랜덤 대상 교환)으로 변경
                elif display_role == '말썽쟁이':
                    print(f"\n카드를 무작위 대상과 맞바꿀 플레이어 1명 선택 (자신 포함 가능): {', '.join(players)}")
                    target = get_valid_input("지목할 플레이어 이름: ", players)
                    
                    if my_role == '말썽쟁이':
                        # 지목한 사람을 제외한 나머지(다른 플레이어 + 바닥 카드들) 중 하나를 무작위로 뽑음
                        possible_targets = [p for p in players if p != target] + [f'바닥{x}' for x in range(1, num_center_cards + 1)]
                        swap_target = random.choice(possible_targets)
                        troublemaker_choice = (target, swap_target)
                        
                    print(f"-> [행동] {target}님의 카드를 무작위 대상(다른 플레이어 또는 바닥)과 몰래 맞바꿨습니다.")
                    time.sleep(PAUSE_TROUBLEMAKER if my_role == '말썽쟁이' else PAUSE_FOOL)
                    
                elif display_role == '스토커':
                    print(f"\n당신의 스토킹 타깃을 지정하세요: {', '.join(other_players)}")
                    target = get_valid_input("낮에 죽이고 싶은 사람의 이름 입력: ", other_players)
                    if my_role == '스토커': stalker_target = target
                    print(f"-> [행동] {target}님을 타깃으로 고정했습니다.")
                    time.sleep(PAUSE_CITIZEN)
                    
                else:
                    print(f"\n[{get_colored_role(display_role)} 행동: 전략 수립 및 블러핑 메모]")
                    custom_input("밤 동안 타이핑 소리를 내어 연기하세요.\n메모 입력: ")
                    print("-> 시스템에 데이터가 반영되는 중입니다...")
                    time.sleep(PAUSE_CITIZEN)
                    
                custom_input("\n확인 완료. [Enter]를 눌러 화면을 지우고 기기를 넘기세요...")
                
            if troublemaker_choice:
                p1, p2 = troublemaker_choice
                game_cards[p1], game_cards[p2] = game_cards[p2], game_cards[p1]
                
            # --- [ 낮 단계 및 결과 정산 ] ---
            clear_screen()
            print("==================================================")
            print(" 아침이 밝았습니다! 모두 눈을 뜨고 서로를 보세요! ")
            print("==================================================")
            print(f" 참여 플레이어 ({num_players}명): {', '.join(players)}")
            print(f" 1. 이번 판 구성 카드: [ {', '.join([get_colored_role(r) for r in roles])} ]")
            print(f" 2. 제한시간 [ {DISCUSSION_TIME_MINUTES}분 ] 동안 토론 후 투표를 진행하세요.")
            print("==================================================")
            
            shaman_success = False
            while True:
                shaman_declare = get_valid_input(f"\n> 정체를 밝히고 직업을 선언할 [{get_colored_role('주술사')}]가 있습니까? (y/n): ", ['y', 'n'])
                
                if shaman_declare == 'y':
                    shaman_claimer = get_valid_input("> 정체를 밝히는 플레이어의 이름을 입력하세요: ", players)
                    
                    if game_cards[shaman_claimer] != '주술사':
                        print(f"\n[경고] 당신은 [{get_colored_role('주술사')}]가 아닙니다!")
                        time.sleep(1.5)
                        clear_screen()
                        print("==================================================")
                        print(" 아침이 밝았습니다! 모두 눈을 뜨고 서로를 보세요! ")
                        print("==================================================")
                        print(f" 참여 플레이어 ({num_players}명): {', '.join(players)}")
                        print(f" 1. 이번 판 구성 카드: [ {', '.join([get_colored_role(r) for r in roles])} ]")
                        print(f" 2. 제한시간 [ {DISCUSSION_TIME_MINUTES}분 ] 동안 토론 후 투표를 진행하세요.")
                        print("==================================================")
                        continue
                        
                    clear_screen()
                    print("==================================================")
                    print(f"               [{get_colored_role('주술사')}]의 두뇌 예언             ")
                    print("==================================================")
                    
                    shaman_pool = sorted(list(set(roles)))
                    shaman_menu = {str(idx + 1): role for idx, role in enumerate(shaman_pool)}
                    for k, v in shaman_menu.items(): print(f"  {k}번. {get_colored_role(v)}")
                    
                    shaman_success = True
                    for p in players:
                        guess_num = get_valid_input(f"> [ {p} ] 님의 최종 직업 번호는?: ", shaman_menu.keys())
                        if shaman_menu[guess_num] != game_cards[p]:
                            shaman_success = False
                            
                    print("\n주술사가 예언을 마쳤습니다. 결과를 확인합니다...")
                    time.sleep(3)
                    
                    if shaman_success:
                        clear_screen()
                        print("==================================================")
                        print(f"          [{get_colored_role('주술사')}] 예언 적중! 단독 승리!        ")
                        print("==================================================")
                        for p in players: print(f"  * {p:<10} : [ {get_colored_role(game_cards[p])} ]")
                        for j in range(num_center_cards): print(f"  * 바닥{j+1:<8} : [ {get_colored_role(game_cards[f'바닥{j+1}'])} ]")
                        custom_input("\n[Enter]를 누르면 메인 메뉴로 돌아갑니다.")
                    else:
                        print(f"\n[결과] 예언이 빗나갔습니다! 주술사는 패배합니다.")
                        custom_input("처형 결과를 확인하려면 [Enter]를 누르세요...")
                    break
                else:
                    break

            if shaman_success: continue 

            # --- [ 낮 투표 정산 단계 ] ---
            clear_screen()
            print("==================================================")
            print("                최종 투표 결과 입력               ")
            print("==================================================")
            print(f"현재 참여 플레이어: {', '.join(players)}")
            
            valid_vote_options = players + ['none']
            executed_player = get_valid_input("> 처형당한 플레이어 이름 (아무도 없으면 'none'): ", valid_vote_options)
            
            madman_win = False
            stalker_win = False
            mafia_win = False
            citizen_win = False
            citizen_lose = False 
            
            if executed_player != 'none' and game_cards[executed_player] == '광인':
                madman_win = True
                
            final_stalker_holder = [k for k, v in game_cards.items() if v == '스토커']
            if final_stalker_holder and final_stalker_holder[0] in players and stalker_target and executed_player == stalker_target:
                stalker_win = True
                
            mafia_holder = [k for k, v in game_cards.items() if v == '마피아'][0]
            mafia_in_play = mafia_holder in players
            
            if executed_player == 'none':
                if mafia_in_play: mafia_win = True
                else: citizen_win = True
            else:
                if game_cards[executed_player] == '마피아':
                    citizen_win = True
                else: 
                    if not mafia_in_play: 
                        citizen_lose = True  
                    else: 
                        mafia_win = True
            
            banners = []
            if madman_win: 
                banners.append(f"{get_colored_team('중립 진영 [광인]')} 단독 승리")
            else:
                if citizen_win: banners.append(f"{get_colored_team('시민 팀')} 승리")
                if mafia_win: banners.append(f"{get_colored_team('마피아 팀')} 승리")
                if citizen_lose: banners.append(f"{get_colored_team('시민 팀')} 패배 (마피아 없음)")
                if stalker_win: banners.append(f"{get_colored_team('중립 진영 [스토커]')} 승리")
                
            winning_banner = " & ".join(banners)
            
            clear_screen()
            print("==========================================================")
            print("                      최종 게임 결과                      ")
            print("==========================================================")
            print(f"\n               결과: {winning_banner}            \n")
            print("==========================================================")
            custom_input("\n상세 직업 확인을 위해 [Enter]를 누르세요...")
            
            print("\n==================================================")
            print("              [상세 역할 및 게임 정산표]          ")
            print("==================================================")
            print("[처음 배분되었던 최초 역할 카드]")
            for p in players:
                fool_marker = f" (겉보기엔 {get_colored_role(fool_disguises[p])}로 위장됨)" if p in fool_disguises else ""
                print(f"  * {p:<10} : [ {get_colored_role(initial_cards[p])} ]{fool_marker}")
            for j in range(num_center_cards):
                print(f"  * 바닥{j+1:<8} : [ {get_colored_role(initial_cards[f'바닥{j+1}'])} ]")
                
            print("\n--------------------------------------------------")
            print("[최종 현재 카드 위치]")
            for p in players: print(f"  * {p:<10} : [ {get_colored_role(game_cards[p])} ]")
            for j in range(num_center_cards): print(f"  * 바닥{j+1:<8} : [ {get_colored_role(game_cards[f'바닥{j+1}'])} ]")
            
            print("\n--------------------------------------------------")
            if troublemaker_choice:
                # 🔥 정산표의 말썽쟁이 출력 내용도 새 로직에 맞게 변경
                print(f"  * 밤사이 [{get_colored_role('말썽쟁이')}] 행동: [ {troublemaker_choice[0]} ] <-> [ {troublemaker_choice[1]} ] 무작위 교환")
            if stalker_target:
                print(f"  * [{get_colored_role('스토커')}] 타깃: [ {stalker_target} ]")
            print("==================================================")
            
            custom_input("\n[Enter]를 누르면 메인 메뉴로 돌아갑니다.")
            continue  

        except ResetGameException:
            clear_screen()
            print("==================================================")
            print("   [안내] 'end' 입력 감지: 처음으로 되돌아갑니다. ")
            print("==================================================")
            time.sleep(1.5)
            continue

if __name__ == "__main__":
    game_moderator()