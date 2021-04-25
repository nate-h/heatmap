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

def save_arr(arr, filename, indent=None):
    """Saves out 2d json arrays."""
    with open(f'{DATA_DIR}{filename}', 'w') as f:
        lists = arr.tolist()
        json.dump(lists, f, indent=indent)


def noise(w, h, filename, indent=None):
    """Generates a noisy 2d array for saving."""
    arr = np.random.rand(w, h)
    arr = np.around(arr, 2)
    save_arr(arr, filename, indent)


def increasing_values(w, h, filename, indent=None):
    """Generates an array from 0 -> (w*h-1) and reshapes it into a wxh 2d array."""
    area = w * h
    arr = (np.arange(0, area)/area).reshape(h, w)
    arr = np.around(arr, 2)
    save_arr(arr, filename, indent)


def generate_logo(upscale_factor, filename, indent=None):
    """Takes pngs and turns them into a 2d gray scaled array for saving."""
    temp = np.asarray(Image.open('sample-heatmaps/logo.png'))
    img = np.dot(temp[..., :3], [0.299, 0.587, 0.144])
    img = img / np.max(img)
    img = np.around(img, 2)
    img = np.kron(img, np.ones((upscale_factor, upscale_factor)))
    save_arr(img, filename, indent)
    # plt.imshow(img)
    # plt.show()


def gauss_2d(w, h, sigma, muu):
    """Generates 2d gaussian array."""
    x, y = np.meshgrid(np.linspace(-1, 1, w), np.linspace(-1, 1, h))
    dst = np.sqrt(x*x+y*y)
    return np.exp(-((dst-muu)**2 / (2.0 * sigma**2)))


def generate_modified_logo(upscale_factor, filename, indent=None):
    """Combines a gray scaled logo with noise and a distribution."""
    temp = np.asarray(Image.open('sample-heatmaps/logo.png'))
    img = np.dot(temp[..., :3], [0.299, 0.587, 0.144])
    img = img / np.max(img)
    img = np.around(img, 2)
    img = np.kron(img, np.ones((upscale_factor, upscale_factor)))

    dist = gauss_2d(img.shape[1], img.shape[0], sigma=0.5, muu=0.25)
    noise = np.random.rand(img.shape[0], img.shape[1])

    combined = 0.5 * img + 0.25 * dist + 0.25 * noise
    combined = np.around(combined, 2)

    save_arr(combined, filename, indent)


###############################
# Generate arrays to play with.
###############################

noise(5, 5, 'noise_5x5.json', indent=4)
noise(1000, 1000, 'noise_1000x1000.json')

increasing_values(10, 10, 'increasing_values_10x10.json', indent=4)

generate_logo(5, 'logo.json')

generate_modified_logo(5, 'modified_logo.json')
