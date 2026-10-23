"""Gera o grafico de notas por pilar (auditoria Simulados Policiais Pro)."""
import matplotlib
matplotlib.use('Agg')
import matplotlib.font_manager as fm
fm.fontManager.addfont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')

import matplotlib.pyplot as plt

plt.rcParams['font.sans-serif'] = ['DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

# Template 07 body palette (fixa)
ACCENT = '#2d7ab3'
HEADER = '#1a4a7a'
TEXT = '#142840'
MUTED = '#5a7a96'
BORDER = '#c0d0e2'
BAND = '#edf2f9'

pilares = [
    'Arquitetura', 'Seguranca', 'Banco de dados', 'Escalabilidade',
    'Performance', 'Resiliencia', 'Observabilidade', 'Testes',
    'Manutenibilidade', 'DevOps/Deploy',
]
notas = [6.0, 2.5, 2.0, 3.5, 5.0, 3.0, 1.5, 0.5, 5.0, 3.0]

# Manter familia de cor unica; intensidade pela nota (mesma matiz)
def cor(n):
    if n >= 5.0:
        return ACCENT
    if n >= 3.0:
        return '#6a9cc4'
    return '#a9c4dc'

fig, ax = plt.subplots(figsize=(7.6, 4.3), dpi=220, constrained_layout=True)
y = range(len(pilares))[::-1]
bars = ax.barh(list(y), notas, height=0.62, color=[cor(n) for n in notas], edgecolor='none', zorder=3)

# valores ao lado de cada barra
for yi, n in zip(y, notas):
    ax.text(n + 0.12, yi, f'{n:.1f}'.replace('.', ','), va='center', ha='left',
            fontsize=10.5, color=TEXT, fontweight='bold', zorder=4)

ax.set_yticks(list(y))
ax.set_yticklabels(pilares, fontsize=10.5, color=TEXT)
ax.set_xlim(0, 10)
ax.set_xticks(range(0, 11, 2))
ax.set_xticklabels([str(i) for i in range(0, 11, 2)], fontsize=9.5, color=MUTED)
ax.set_xlabel('Nota (0 a 10)', fontsize=10, color=MUTED)

ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_visible(False)
ax.spines['bottom'].set_color(BORDER)
ax.tick_params(axis='y', length=0)
ax.tick_params(axis='x', color=BORDER)
ax.grid(axis='x', linestyle='--', linewidth=0.5, alpha=0.25, color=HEADER, zorder=0)
ax.axvline(3.2, color='#a05252', linewidth=1.4, linestyle='--', zorder=2)
ax.text(3.28, 9.35, 'nota geral 3,2', fontsize=9.5, color='#a05252', fontweight='bold', va='top')

fig.savefig('/home/z/my-project/scripts/audit_scores.png', facecolor='white')
print('OK audit_scores.png')
