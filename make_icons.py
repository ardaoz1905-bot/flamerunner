from PIL import Image
import math
G=32
def flame():
    px=[[None]*G for _ in range(G)]
    cols={'K':(58,8,0),'R':(215,58,12),'O':(255,138,31),'Y':(255,210,58),'W':(255,246,192)}
    top,bot=3,29
    for y in range(top,bot+1):
        t=(y-top)/(bot-top)
        hw=11.5*(t**0.72)*math.sqrt(max(0,1-t**4.5))+(0.8 if t<0.2 else 0)
        sx=16+3.2*math.sin(t*5.2)*(1-t)
        for x in range(G):
            u=abs(x-sx)/max(hw,.01)
            if hw>0.6 and u<=1:
                c='R' if u>.74 else 'O' if u>.46 else 'Y'
                if t>.5 and u<.24: c='W'
                px[y][x]=c
    out=[r[:] for r in px]
    for y in range(G):
        for x in range(G):
            if px[y][x] is None:
                for dx,dy in((1,0),(-1,0),(0,1),(0,-1)):
                    xx,yy=x+dx,y+dy
                    if 0<=xx<G and 0<=yy<G and px[yy][xx] is not None:
                        out[y][x]='K';break
    im=Image.new('RGBA',(G,G),(0,0,0,0))
    for y in range(G):
        for x in range(G):
            if out[y][x]: im.putpixel((x,y),cols[out[y][x]]+(255,))
    return im
F=flame()
BG=(10,6,5,255)
def canvas(size,fl,bg):
    im=Image.new('RGBA',(size,size),bg if bg else (0,0,0,0))
    f=F.resize((fl,fl),Image.NEAREST)
    im.alpha_composite(f,((size-fl)//2,(size-fl)//2)); return im
import os
os.makedirs('assets',exist_ok=True)
d='assets/'
canvas(1024,800,BG).convert('RGB').save(d+'icon-only.png')
canvas(1024,620,None).save(d+'icon-foreground.png')
Image.new('RGB',(1024,1024),BG[:3]).save(d+'icon-background.png')
for n in('splash','splash-dark'):
    canvas(2732,640,BG).convert('RGB').save(d+n+'.png')
print('ok')
