import { Template } from "../../src/index.js";

export default async function wait(
  value: Template,
  delay: number
): Promise<Template> {
  return new Promise((resolve) => setTimeout(() => resolve(value), delay));
}

// export async function fragileWait(value: Template, delay: number): Promise<Template> {
//   return new Promise((resolve, reject) =>
//     setTimeout(() => {
//       if (Math.random() > 0.5) {
//         return resolve(value);
//       }
//       return reject();
//     }, delay)
//   );
// }
