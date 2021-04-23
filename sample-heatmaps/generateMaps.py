"""This file contains several functions I used to generate 2d arrays to display
in the heatmap. All values in the arrays are between 0 and 1.
"""

from PIL import Image
import matplotlib.pyplot as plt
import numpy as np
import json


DATA_DIR = 'sample-heatmaps/'

###############################
# Functions to generate arrays.
###############################

def save_arr(arr, filename):
     with open(f'{DATA_DIR}{filename}', 'w') as f:
          lists = arr.tolist()
          json.dump(lists, f, indent=4)


def noise(w, h, filename):
     arr = np.random.rand(w, h)
     arr = np.around(arr, 2)
     save_arr(arr, filename)


def increasing_values(w, h, filename):
     area = w * h
     arr = (np.arange(0, area)/area).reshape(w, h)
     arr = np.around(arr, 2)
     save_arr(arr, filename)


def generate_logo(upscale_factor, filename):
     temp = np.asarray(Image.open('sample-heatmaps/logo.png'))
     img = np.dot(temp[...,:3], [0.299, 0.587, 0.144])
     img = img / np.max(img)
     img = np.around(img, 2)
     img = np.kron(img, np.ones((upscale_factor, upscale_factor)))
     save_arr(img, filename)
     plt.imshow(img)
     plt.show()


###############################
# Generate arrays to play with.
###############################

noise(5, 5, 'noise_5x5.json')
noise(1000, 1000, 'noise_1000x1000.json')

increasing_values(10, 10, 'increasing_values_10x10.json')

generate_logo(5, 'logo.json')
