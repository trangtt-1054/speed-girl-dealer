export function getAsString(value: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

/** 
www.myapp.com?myParam=hello&myParam=morehello
query.myParam = [hello, morehello]
 => to avoid those type of scenario, we just grab the first one

**/
