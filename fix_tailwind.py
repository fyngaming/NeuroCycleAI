from pathlib import Path
path = Path(r"d:\NEURO CYCLE\src\App.tsx")
text = path.read_text(encoding="utf-8")
replacements = {
    'transition-colors shadow-lg shadow-emerald-900/20 active:scale-95 transition-all': 'shadow-lg shadow-emerald-900/20 active:scale-95 transition-all',
    'bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]': 'bg-linear-to-tr from-[#f09433] via-[#cc2366] to-[#bc1888]',
    'rounded-[32px]': 'rounded-4xl',
    'rounded-[24px]': 'rounded-3xl',
    'flex-shrink-0': 'shrink-0',
    'z-[150]': 'z-150',
    'z-[120]': 'z-120',
    'z-[200]': 'z-200',
    'z-[100]': 'z-100',
    'z-[80]': 'z-80',
    'z-[70]': 'z-70',
    'z-[60]': 'z-60',
    'bg-gradient-to-br': 'bg-linear-to-br',
    'bg-gradient-to-tr': 'bg-linear-to-tr',
    'bg-gradient-to-r': 'bg-linear-to-r',
    'min-w-[80px]': 'min-w-20',
    'min-w-[600px]': 'min-w-150',
    'p-[1px]': 'p-px',
    'tracking-[0.1em]': 'tracking-widest',
    'flex-[2]': 'flex-2',
}
for old, new in replacements.items():
    text = text.replace(old, new)
path.write_text(text, encoding="utf-8")
print('done')
