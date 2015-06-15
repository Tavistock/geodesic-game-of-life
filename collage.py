from PIL import Image
import os, sys

if __name__ == "__main__":
    img_from = sys.argv[1]
    img_to = sys.argv[2]

    first  = os.listdir(img_from)[0]
    size = Image.open(img_from + '/' + first).size[0]

    files = os.listdir(img_from)
    new_img = Image.new('RGB', (size*3, size*3))

    index = 0

    for x in xrange(0, size*3, size):
        for y in xrange(0, size*3, size):
            img = Image.open(img_from + '/' + files[index])
            new_img.paste(img, (x,y,x+size, y+size))
            index += 1

    new_img.save(img_to, 'PNG')


