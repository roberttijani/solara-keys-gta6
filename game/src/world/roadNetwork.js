import * as THREE from 'three';

export class RoadNetwork {
  constructor() {
    this.nodes = [];
    this.segments = [];
    this.initGraph();
  }

  addNode(x, y, z, id = null) {
    const node = { id: id || this.nodes.length, pos: new THREE.Vector3(x, y, z), neighbors: [] };
    this.nodes.push(node);
    return node;
  }

  addSegment(nodeA, nodeB, lanes = 2, isBridge = false, speedLimit = 60) {
    nodeA.neighbors.push(nodeB);
    nodeB.neighbors.push(nodeA);
    const seg = { a: nodeA, b: nodeB, lanes, isBridge, speedLimit };
    this.segments.push(seg);
    return seg;
  }

  initGraph() {
    // 1. Neon Promenade Boulevard (Ocean Drive North-South Spine)
    const np1 = this.addNode(180, 0.1, -220, 'np_north');
    const np2 = this.addNode(180, 0.1, -100, 'np_mid_north');
    const np3 = this.addNode(180, 0.1, 0, 'np_center');
    const np4 = this.addNode(180, 0.1, 120, 'np_south');
    this.addSegment(np1, np2, 4);
    this.addSegment(np2, np3, 4);
    this.addSegment(np3, np4, 4);

    // Parallel Beachfront strip road
    const np_b1 = this.addNode(250, 0.1, -200);
    const np_b2 = this.addNode(250, 0.1, 0);
    const np_b3 = this.addNode(250, 0.1, 100);
    this.addSegment(np_b1, np_b2, 2);
    this.addSegment(np_b2, np_b3, 2);
    this.addSegment(np2, np_b1, 2);
    this.addSegment(np3, np_b2, 2);
    this.addSegment(np4, np_b3, 2);

    // 2. Downtown Spire Financial Grid
    const dt1 = this.addNode(50, 0.1, -200, 'dt_east');
    const dt2 = this.addNode(-50, 0.1, -200, 'dt_center_south');
    const dt3 = this.addNode(-50, 0.1, -320, 'dt_bank_junction');
    const dt4 = this.addNode(50, 0.1, -320, 'dt_north_east');
    const dt5 = this.addNode(-150, 0.1, -320, 'dt_west');
    const dt6 = this.addNode(-150, 0.1, -200, 'dt_south_west');

    this.addSegment(np1, dt1, 4);
    this.addSegment(np2, dt1, 2);
    this.addSegment(dt1, dt2, 4);
    this.addSegment(dt2, dt3, 4);
    this.addSegment(dt3, dt4, 4);
    this.addSegment(dt4, dt1, 4);
    this.addSegment(dt3, dt5, 4);
    this.addSegment(dt5, dt6, 4);
    this.addSegment(dt6, dt2, 4);

    // 3. Palma Heights Hillside Ridge Road
    const ph1 = this.addNode(120, 5.0, -350, 'ph_entrance');
    const ph2 = this.addNode(240, 12.0, -420, 'ph_mid_ridge');
    const ph3 = this.addNode(340, 20.0, -380, 'ph_villa_summit');
    const ph4 = this.addNode(300, 16.0, -280, 'ph_east_descent');

    this.addSegment(dt4, ph1, 2);
    this.addSegment(ph1, ph2, 2);
    this.addSegment(ph2, ph3, 2);
    this.addSegment(ph3, ph4, 2);
    this.addSegment(ph4, np1, 2);

    // 4. Cayo Industrial Docks & Chop-Shop
    const ci1 = this.addNode(-250, 0.1, -200, 'ci_entrance');
    const ci2 = this.addNode(-360, 0.1, -200, 'ci_garage_hub');
    const ci3 = this.addNode(-460, 0.1, -260, 'ci_refinery_north');
    const ci4 = this.addNode(-420, 0.1, -120, 'ci_scrapyard_south');

    this.addSegment(dt6, ci1, 4);
    this.addSegment(ci1, ci2, 4);
    this.addSegment(ci2, ci3, 2);
    this.addSegment(ci3, ci4, 2);
    this.addSegment(ci4, ci2, 2);

    // 5. Puerto Solara Harbor & Marina Basin
    const ps1 = this.addNode(-180, 0.1, -50, 'ps_north_junction');
    const ps2 = this.addNode(-260, 0.1, 50, 'ps_wharf');
    const ps3 = this.addNode(-380, 0.1, 140, 'ps_pier_terminal');
    const ps4 = this.addNode(-420, 0.1, 240, 'ps_lighthouse_turn');
    const ps5 = this.addNode(-260, 0.1, 220, 'ps_marina_basin');

    this.addSegment(ci1, ps1, 4);
    this.addSegment(ps1, ps2, 2);
    this.addSegment(ps2, ps3, 2);
    this.addSegment(ps3, ps4, 2);
    this.addSegment(ps4, ps5, 2);
    this.addSegment(ps5, ps2, 2);

    // 6. Coral Causeway Twin Ocean Bridges (Connecting Mainland to Outer Key)
    const cc_start_east = this.addNode(80, 0.1, 50, 'cc_mainland_east');
    const cc_start_west = this.addNode(-40, 0.1, 20, 'cc_mainland_west');
    const cc_ramp_e = this.addNode(60, 3.8, 120, 'cc_bridge_e1');
    const cc_ramp_w = this.addNode(-40, 3.8, 120, 'cc_bridge_w1');
    const cc_mid_e = this.addNode(40, 4.0, 220, 'cc_bridge_e2');
    const cc_mid_w = this.addNode(-40, 4.0, 220, 'cc_bridge_w2');
    const cc_key_e = this.addNode(20, 0.2, 300, 'cc_key_east');
    const cc_key_w = this.addNode(-60, 0.2, 300, 'cc_key_west');
    const cc_key_slip = this.addNode(-20, 0.2, 360, 'cc_key_marina_slip');

    // Mainland connections to bridges
    this.addSegment(np3, cc_start_east, 4);
    this.addSegment(ps1, cc_start_west, 4);
    this.addSegment(cc_start_east, cc_ramp_e, 2, true, 80);
    this.addSegment(cc_start_west, cc_ramp_w, 2, true, 80);

    // Elevated bridge spans over deep water
    this.addSegment(cc_ramp_e, cc_mid_e, 2, true, 90);
    this.addSegment(cc_ramp_w, cc_mid_w, 2, true, 90);
    this.addSegment(cc_mid_e, cc_key_e, 2, true, 80);
    this.addSegment(cc_mid_w, cc_key_w, 2, true, 80);

    // Outer Key loop
    this.addSegment(cc_key_e, cc_key_slip, 2);
    this.addSegment(cc_key_w, cc_key_slip, 2);
    this.addSegment(cc_key_e, cc_key_w, 2);
  }

  getNearestNode(pos, filterBridge = false) {
    let best = null;
    let minDst = Infinity;
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      const d = pos.distanceTo(node.pos);
      if (d < minDst) {
        minDst = d;
        best = node;
      }
    }
    return best;
  }

  getRandomNode() {
    const idx = Math.floor(Math.random() * this.nodes.length);
    return this.nodes[idx];
  }

  getNextWaypoint(currentNode, previousNode = null) {
    if (!currentNode || !currentNode.neighbors.length) return null;
    const candidates = currentNode.neighbors.filter((n) => n !== previousNode);
    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
    return currentNode.neighbors[0];
  }
}
