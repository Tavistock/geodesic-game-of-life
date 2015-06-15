from PIL import Image
import sys, os

left = 397
top = 105

width = 574
height = 574

if __name__ = "__main__":
    img_from = sys.argv[0]
    img_to = sys.argv[1]
    counter = 0
    for x in os.listdir(img_from):
        a = Image.open(img_from + "/" + x)
        b = a.crop((left, top, left+width, top+height))
        b.save(img_to + '/gol' + str(counter) + ".png", 'PNG')
        counter += 1
