import random

class BaseMultiSet:
    def __init__(self) -> None:
        self.data = []
    def append(self, element):
        self.data.append(element)
    def union(self, other):
        new_ms = BaseMultiSet()
        new_ms.data = self.data + other.data
        return new_ms
    def intersection(self, other):
        new_ms = BaseMultiSet()
        for element in self.data:
            if element in other.data:
                new_ms.append(element)
        return new_ms
    def choose_and_remove(self):
        element_to_serve = random.choice(self.data)
        self.data = [value for value in self.data if value != element_to_serve]
        return element_to_serve
    def show(self):
        print(self.data)
